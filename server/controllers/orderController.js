import Order from "../models/Order.js";
import Product from "../models/Product.js";
import qs from 'qs';
import crypto from 'crypto';
import mongoose from "mongoose";
import dateFormat from "dateformat";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession(); // Bắt đầu session
  session.startTransaction(); // Bắt đầu transaction

  try {
    const { user_id, items, total_price, status, paymentMethod } = req.body;

    // Kiểm tra sản phẩm trước khi xử lý
    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          message: `Không tìm thấy sản phẩm với ID: ${item.product_id}`,
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Sản phẩm ${product.name} không đủ số lượng trong kho`,
        });
      }
    }

    if (paymentMethod === "COD") {
      // Giảm số lượng tồn kho trong transaction
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      const newOrder = new Order({
        user_id,
        items,
        total_price,
        payment_method: paymentMethod,
        status
      });

      const savedOrder = await newOrder.save({ session });
      await session.commitTransaction();
      
      return res.status(201).json(savedOrder);
    } 
    else if (paymentMethod === "Vnpay") {
      const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

      const tmnCode = "XPZ0FN4U";
      const secretKey = "Z6H5N91JUOPRXE51GHPRVPYT2HCRHGS4"
      const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const returnUrl = "http://localhost:5000/api/orders/checkoutVnpay";

      const date = new Date();
      const createDate = dateFormat(date, 'yyyymmddHHmmss');
      const orderId = dateFormat(date, 'HHmmss');

      const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: total_price * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_ExpireDate: dateFormat(new Date(date.getTime() + 15 * 60 * 1000), 'yyyymmddHHmmss'),
        vnp_CreateDate: createDate,
      };
      

      const sortedParams = sortObject(vnp_Params);
      const signData = qs.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
      sortedParams['vnp_SecureHash'] = signed;

      const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });

      const newOrder = new Order({
        user_id,
        items,
        total_price,
        payment_method: paymentMethod,
        status,
        vnp_TransactionId: orderId
      });

      const savedOrder = await newOrder.save({ session });
      await session.commitTransaction();

      return res.status(200).json({
        order: savedOrder,
        payment_url: paymentUrl,
        message: 'Vui lòng thanh toán qua VNPay'
      });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating order:', error);
    
    // Kiểm tra loại lỗi cụ thể
    if (error.name === 'MongooseTimeoutError') {
      return res.status(504).json({ 
        message: "Database operation timeout",
        suggestion: "Vui lòng thử lại sau hoặc kiểm tra kết nối database"
      });
    }
    
    return res.status(500).json({ 
      message: error.message || "Lỗi server khi tạo đơn hàng" 
    });
  } finally {
    session.endSession();
  }
};

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

export const checkpaymentvnpay = async (req, res) => {
  const { vnpay_ResponseCode, vnp_OrderInfo } = req.query;
  if(vnpay_ResponseCode === "00") {
    console.log("kjbkjbk");
  } else if(vnpay_ResponseCode === "70") {
    console.log("khong thanh toan");
    res.send("/jhkjk")
  }
}

// Lấy tất cả đơn hàng với tùy chọn lọc theo user_id
export const getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = {};

    if (user_id) {
      query.user_id = user_id;
    }

    const orders = await Order.find(query)
      .populate("user_id")
      .populate("items.product_id");

    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy đơn hàng theo ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id")
      .populate("items.product_id");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const currentOrder = await Order.findById(orderId);

    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "Đã hủy" && currentOrder.status !== "Đã hủy") {
      for (const item of currentOrder.items) {
        const product = await Product.findById(item.product_id);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user_id")
      .populate("items.product_id");
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { timeFilter = "7days" } = req.query;
    let startDate = new Date();

    switch (timeFilter) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "year":
        startDate = new Date(startDate.getFullYear(), 0, 1);
        break;
      case "all":
        startDate = new Date(2000, 0, 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const orders = await Order.find({
      order_date: { $gte: startDate },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    const monthlyStartDate = new Date();
    monthlyStartDate.setDate(monthlyStartDate.getDate() - 30);
    const monthlyRevenue = orders
      .filter((order) => new Date(order.order_date) >= monthlyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);

    const weeklyStartDate = new Date();
    weeklyStartDate.setDate(weeklyStartDate.getDate() - 7);
    const weeklyRevenue = orders
      .filter((order) => new Date(order.order_date) >= weeklyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);

    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    res.status(200).json({
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      averageOrderValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const orders = await Order.find()
      .sort({ order_date: -1 })
      .limit(parseInt(limit))
      .populate("user_id", "fullName");

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      customer: order.user_id ? order.user_id.fullName : "Unknown Customer",
      total: order.total_price,
      status: order.status,
      date: order.order_date,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
