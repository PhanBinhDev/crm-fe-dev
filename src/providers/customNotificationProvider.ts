import { notification } from "antd";
import type { NotificationProvider } from "@refinedev/core";

// Provider tùy biến đảm bảo hiển thị cả description
export const customNotificationProvider: NotificationProvider = {
  open: ({ message, description, type, key }) => {
    // Chỉ cho phép các loại hợp lệ của Ant Design notification
    const allowedTypes = ["success", "info", "warning", "error"] as const;
    const method = allowedTypes.includes(type as any) ? type as "success" | "info" | "warning" | "error" : "info";

    notification[method]({
      message,
      description,
      key,
    });
  },
  close: (key: string) => {
    notification.destroy(key);
  },
};
