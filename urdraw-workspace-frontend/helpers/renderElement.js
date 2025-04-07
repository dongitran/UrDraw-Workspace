import { Badge } from "@/components/ui/badge";

export const renderMethod = (method) => {
  if (method === "PATCH") {
    return <Badge>Chỉnh sửa 1 phần</Badge>;
  } else if (method === "DELETE") {
    return <Badge>Xóa</Badge>;
  } else if (method === "PUT") {
    return <Badge>Chỉnh sửa toàn bộ</Badge>;
  }
};
