import { FC } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCan } from "@refinedev/core";
import { useAuth } from "@/hooks/useAuth";

export const SemesterActions: FC = () => {
  const navigate = useNavigate();
  const { user: identity } = useAuth();

  const { data: canCreate } = useCan({
    resource: "semesters", // đổi sang resource của kỳ học
    action: "create",
    params: { identity },
  });

  if (!canCreate?.can) {
    return null;
  }

  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate("/semesters/create")}
    >
      Thêm kỳ học
    </Button>
  );
};
