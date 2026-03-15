import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-6">
        <div className="app-panel flex flex-col items-center gap-4 rounded-[2rem] px-8 py-7">
          <BrandMark className="orange-glow h-20 w-20 rounded-[2rem]" imageClassName="h-14 w-14" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
