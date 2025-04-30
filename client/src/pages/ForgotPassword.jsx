import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added for password confirmation
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Verify Code, Step 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(null);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/users/forgotpassword", { email });
      if (response.data.success) {
        setOtp(response.data.otp);
        toast.success(response.data.message);
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast.error("Vui lòng nhập mã xác thực.");
      return;
    }
    setLoading(true);
    try {
      if (verificationCode != otp) {
        toast.error("Mã xác thực không đúng.");
        return;
      }
      toast.success("Mã xác thực thành công.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/users/resetpassword", {
        email,
        newPassword,
      });
      toast.success(response.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ScaleLoader color="#ffffff" />
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Quên Mật Khẩu
        </h1>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              onClick={handleSendCode}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
            >
              Gửi Mã Xác Thực
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã Xác Thực
              </label>
              <input
                type="text"
                placeholder="Nhập mã xác thực"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
            >
              Xác Nhận Mã
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật Khẩu Mới
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác Nhận Mật Khẩu
              </label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
            >
              Đặt Lại Mật Khẩu
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ForgotPassword;