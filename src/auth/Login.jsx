import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { otpSend } from "@/api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function sendOtp() {
    setLoading(true);
    const data = await otpSend(email)
    if (data.success) {
        setLoading(false);
        navigate("/verify-otp", { state: { email } });
    }
    
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-95">
        <CardHeader>
          <CardTitle>Login (Use BLiss iQ Login credential)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" onClick={sendOtp} disabled={loading}>
            Send OTP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
