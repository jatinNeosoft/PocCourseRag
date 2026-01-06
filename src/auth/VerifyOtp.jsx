import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setToken } from "@/lib/utils";
import { otpVerify } from "@/api/auth";


export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  async function verifyOtp() {

    const res = await otpVerify({email:state.email, otp:otp, deviceId:"fffffffffffff"})
    // ✅ Store token
    setToken(res.token);

    navigate("/");
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-95">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button className="w-full" onClick={verifyOtp}>
            Verify & Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
