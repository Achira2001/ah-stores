import {
  NextRequest,
  NextResponse,
} from "next/server"

import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"

import Order from "@/models/Order"
import Product from "@/models/Product"
import Notification from "@/models/Notification"
import User from "@/models/User"

import mongoose from "mongoose"

import {
  sendOrderConfirmationEmail,
} from "@/lib/mail"

// =====================================================
// GET ORDERS
// =====================================================

export async function GET(
  req: NextRequest
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    await connectDB()

    if (!session.user.email) {
      return NextResponse.json(
        {
          error:
            "User email not available.",
        },
        {
          status: 400,
        }
      )
    }

    const mongoUser =
      await User.findOne({
        email:
          session.user.email,
      }).select(
        "_id role name email"
      )

    if (!mongoUser) {
      return NextResponse.json(
        {
          error:
            "User account not found",
        },
        {
          status: 404,
        }
      )
    }

    const query =
      mongoUser.role === "admin"
        ? {}
        : {
            user: mongoUser._id,
          }

    const orders =
      await Order.find(query)
        .populate(
          "user",
          "_id name email"
        )
        .populate(
          "items.product",
          "name images colorVariants stock"
        )
        .sort({
          createdAt: -1,
        })
        .lean()

    return NextResponse.json(
      orders
    )
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to fetch orders",
      },
      {
        status: 500,
      }
    )
  }
}

// =====================================================
// POST CREATE COD ORDER
// =====================================================

export async function POST(
  req: NextRequest
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    const body =
      await req.json()

    const {
      items,
      shippingAddress,
      paymentMethod,
    } = body

    // =================================================
    // VALIDATE ITEMS
    // =================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Your cart is empty.",
        },
        {
          status: 400,
        }
      )
    }

    // =================================================
    // VALIDATE PAYMENT METHOD
    // =================================================

    if (
      !["cod", "card"].includes(
        paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment method.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Card orders should be created through the Stripe
     * checkout endpoint, not this endpoint.
     */
    if (paymentMethod === "card") {
      return NextResponse.json(
        {
          error:
            "Card payments must be processed through Stripe Checkout.",
        },
        {
          status: 400,
        }
      )
    }

    // =================================================
    // SHIPPING ADDRESS
    // =================================================

    if (!shippingAddress) {
      return NextResponse.json(
        {
          error:
            "Shipping address is required.",
        },
        {
          status: 400,
        }
      )
    }

    const {
      fullName,
      phone,
      address,
      city,
      postalCode,
    } = shippingAddress

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide all required shipping details.",
        },
        {
          status: 400,
        }
      )
    }

    // =================================================
    // DATABASE
    // =================================================

    await connectDB()

    if (!session.user.email) {
      return NextResponse.json(
        {
          error:
            "Authenticated user email not available.",
        },
        {
          status: 400,
        }
      )
    }

    const mongoUser =
      await User.findOne({
        email:
          session.user.email,
      }).select(
        "_id name email role"
      )

    if (!mongoUser) {
      return NextResponse.json(
        {
          error:
            "User account not found in database.",
        },
        {
          status: 404,
        }
      )
    }

    // =================================================
    // PREPARE ORDER
    // =================================================

    const orderItems: {
      product: mongoose.Types.ObjectId
      name: string
      image: string
      price: number
      quantity: number
      color?: string
    }[] = []

    let calculatedTotal = 0

    const processedVariants =
      new Set<string>()

    // =================================================
    // VALIDATE EVERY CART ITEM
    // =================================================

    for (const item of items) {
      const productId =
        String(
          item?.productId || ""
        ).trim()

      const color =
        item?.color
          ? String(
              item.color
            ).trim()
          : undefined

      const quantity =
        Number(
          item?.quantity
        )

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid product ID.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid product quantity.",
          },
          {
            status: 400,
          }
        )
      }

      const variantKey =
        `${productId}::${color || "__default__"}`

      if (
        processedVariants.has(
          variantKey
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Duplicate product colour entries are not allowed.",
          },
          {
            status: 400,
          }
        )
      }

      processedVariants.add(
        variantKey
      )

      const product =
        await Product.findById(
          productId
        )

      if (!product) {
        return NextResponse.json(
          {
            error:
              "Product not found.",
          },
          {
            status: 400,
          }
        )
      }

      // =================================================
      // COLOUR PRODUCT
      // =================================================

      if (
        product.colorVariants &&
        product.colorVariants.length >
          0
      ) {
        if (!color) {
          return NextResponse.json(
            {
              error:
                `Please select a colour for ${product.name}.`,
            },
            {
              status: 400,
            }
          )
        }

        const variant =
          product.colorVariants.find(
            (v) =>
              v.color === color
          )

        if (!variant) {
          return NextResponse.json(
            {
              error:
                `Colour ${color} is not available for ${product.name}.`,
            },
            {
              status: 400,
            }
          )
        }

        if (
          variant.stock <
          quantity
        ) {
          return NextResponse.json(
            {
              error:
                `Insufficient ${color} stock for ${product.name}. Available: ${variant.stock}`,
            },
            {
              status: 400,
            }
          )
        }

        if (
          paymentMethod === "cod" &&
          !product.codAvailable
        ) {
          return NextResponse.json(
            {
              error:
                `${product.name} does not support Cash on Delivery.`,
            },
            {
              status: 400,
            }
          )
        }

        const price =
          Number(product.price)

        const image =
          variant.images?.[0] ||
          product.images?.[0] ||
          ""

        calculatedTotal +=
          price * quantity

        orderItems.push({
          product:
            product._id as mongoose.Types.ObjectId,

          name:
            product.name,

          image,

          price,

          quantity,

          color,
        })
      } else {
        // =================================================
        // NORMAL PRODUCT
        // =================================================

        if (
          product.stock <
          quantity
        ) {
          return NextResponse.json(
            {
              error:
                `Insufficient stock for ${product.name}. Available: ${product.stock}`,
            },
            {
              status: 400,
            }
          )
        }

        if (
          paymentMethod === "cod" &&
          !product.codAvailable
        ) {
          return NextResponse.json(
            {
              error:
                `${product.name} does not support Cash on Delivery.`,
            },
            {
              status: 400,
            }
          )
        }

        const price =
          Number(product.price)

        const image =
          product.images?.[0] ||
          ""

        calculatedTotal +=
          price * quantity

        orderItems.push({
          product:
            product._id as mongoose.Types.ObjectId,

          name:
            product.name,

          image,

          price,

          quantity,
        })
      }
    }

    calculatedTotal =
      Math.round(
        calculatedTotal * 100
      ) / 100

    // =================================================
    // REDUCE STOCK ATOMICALLY
    // =================================================

    const stockUpdated: {
      productId: mongoose.Types.ObjectId
      color?: string
      quantity: number
    }[] = []

    try {
      for (
        const item of orderItems
      ) {
        if (item.color) {
          const updated =
            await Product.findOneAndUpdate(
              {
                _id:
                  item.product,

                colorVariants: {
                  $elemMatch: {
                    color:
                      item.color,

                    stock: {
                      $gte:
                        item.quantity,
                    },
                  },
                },
              },
              {
                $inc: {
                  "colorVariants.$[variant].stock":
                    -item.quantity,

                  stock:
                    -item.quantity,
                },
              },
              {
                arrayFilters: [
                  {
                    "variant.color":
                      item.color,

                    "variant.stock":
                      {
                        $gte:
                          item.quantity,
                      },
                  },
                ],

                new: true,
              }
            )

          if (!updated) {
            throw new Error(
              `Stock changed while placing the order for ${item.name} (${item.color}).`
            )
          }
        } else {
          const updated =
            await Product.findOneAndUpdate(
              {
                _id:
                  item.product,

                stock: {
                  $gte:
                    item.quantity,
                },
              },
              {
                $inc: {
                  stock:
                    -item.quantity,
                },
              },
              {
                new: true,
              }
            )

          if (!updated) {
            throw new Error(
              `Stock changed while placing the order for ${item.name}.`
            )
          }
        }

        stockUpdated.push({
          productId:
            item.product,

          color:
            item.color,

          quantity:
            item.quantity,
        })
      }
    } catch (stockError) {
      /*
       * Roll back any stock reductions that happened
       * before the failed item.
       */
      for (
        const updated of stockUpdated
      ) {
        try {
          if (updated.color) {
            await Product.findOneAndUpdate(
              {
                _id:
                  updated.productId,
              },
              {
                $inc: {
                  "colorVariants.$[variant].stock":
                    updated.quantity,

                  stock:
                    updated.quantity,
                },
              },
              {
                arrayFilters: [
                  {
                    "variant.color":
                      updated.color,
                  },
                ],
              }
            )
          } else {
            await Product.findByIdAndUpdate(
              updated.productId,
              {
                $inc: {
                  stock:
                    updated.quantity,
                },
              }
            )
          }
        } catch (rollbackError) {
          console.error(
            "Stock rollback error:",
            rollbackError
          )
        }
      }

      throw stockError
    }

    // =================================================
    // CREATE ORDER
    // =================================================

    let order

    try {
      order =
        await Order.create({
          user:
            mongoUser._id,

          items:
            orderItems,

          shippingAddress: {
            fullName:
              fullName.trim(),

            phone:
              phone.trim(),

            address:
              address.trim(),

            city:
              city.trim(),

            postalCode:
              postalCode?.trim() ||
              undefined,
          },

          totalAmount:
            calculatedTotal,

          paymentMethod:
            "cod",

          status:
            "pending",

          paymentStatus:
            "pending",
        })
    } catch (orderError) {
      /*
       * If order creation fails, restore stock.
       */
      for (
        const updated of stockUpdated
      ) {
        try {
          if (updated.color) {
            await Product.findOneAndUpdate(
              {
                _id:
                  updated.productId,
              },
              {
                $inc: {
                  "colorVariants.$[variant].stock":
                    updated.quantity,

                  stock:
                    updated.quantity,
                },
              },
              {
                arrayFilters: [
                  {
                    "variant.color":
                      updated.color,
                  },
                ],
              }
            )
          } else {
            await Product.findByIdAndUpdate(
              updated.productId,
              {
                $inc: {
                  stock:
                    updated.quantity,
                },
              }
            )
          }
        } catch (rollbackError) {
          console.error(
            "Order creation rollback error:",
            rollbackError
          )
        }
      }

      throw orderError
    }

    // =================================================
    // CUSTOMER NOTIFICATION
    // =================================================

    try {
      await Notification.create({
        user:
          mongoUser._id,

        title:
          "Order Placed Successfully",

        message:
          `Your order #${order._id
            .toString()
            .slice(-6)} has been placed.`,

        type:
          "order",

        link:
          "/orders",
      })
    } catch (error) {
      console.error(
        "Customer notification error:",
        error
      )
    }

    // =================================================
    // ADMIN NOTIFICATION
    // =================================================

    try {
      const admins =
        await User.find({
          role: "admin",
        }).select("_id")

      await Promise.all(
        admins.map((admin) =>
          Notification.create({
            user:
              admin._id,

            title:
              "New Order Received",

            message:
              `New order #${order._id
                .toString()
                .slice(-6)} for LKR ${calculatedTotal.toLocaleString()}`,

            type:
              "order",

            link:
              "/dashboard/orders",
          })
        )
      )
    } catch (error) {
      console.error(
        "Admin notification error:",
        error
      )
    }

    // =================================================
    // EMAIL
    // =================================================

    if (
      session.user.email
    ) {
      try {
        await sendOrderConfirmationEmail(
          session.user.email,
          {
            orderId:
              order._id
                .toString()
                .slice(-6),

            total:
              calculatedTotal,

            paymentMethod:
              "cod",
          }
        )
      } catch (error) {
        console.error(
          "Failed to send order confirmation email:",
          error
        )
      }
    }

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        message:
          "Order placed successfully",

        order,
      },
      {
        status: 201,
      }
    )
  } catch (error: any) {
    console.error(
      "Create order error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to place order",
      },
      {
        status: 500,
      }
    )
  }
}