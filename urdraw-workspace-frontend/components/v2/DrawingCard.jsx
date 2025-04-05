const { Fragment, useState } = require("react");
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import DrawingModal from "@/components/v2/DrawingModal";
import { buildUrDrawUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Pen, Share2, Trash2 } from "lucide-react";

const DrawingCard = ({ queryKey, drawing = {} }) => {
  const queryClient = useQueryClient();

  const [openCollectionModal, setOpenCollectionModal] = useState("");
  const handleDrawingClick = async () => {
    try {
      const token = getToken();
      if (token) {
        const drawingUrl = buildUrDrawUrl(token, drawing.id, drawing.type);
        window.location.href = drawingUrl;
      }
    } catch (error) {}
  };
  const handleClickMenu = async (type) => {
    setOpenCollectionModal(type);
  };
  return (
    <Fragment>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            style={{
              backgroundImage: `url(${drawing.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="@container/card rounded-sm shadow-lg hover:shadow-slate-700"
            onDoubleClick={handleDrawingClick}
          >
            <CardHeader className="relative">
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {drawing.name}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="font-medium truncate w-full">{drawing.userId}</div>
              <div className="text-muted-foreground text-xs">
                {dayjs(drawing.createdAt).format("HH:mm - DD/MM/YYYY")}
              </div>
            </CardFooter>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset className="cursor-pointer" onClick={() => handleClickMenu("edit")}>
            Edit Name
            <ContextMenuShortcut>
              <Pen className="h-4 w-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem className="cursor-pointer" inset onClick={() => handleClickMenu("delete")}>
            Delete Drawing
            <ContextMenuShortcut>
              <Trash2 className="h-4 w-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DrawingModal
        refetch={() => {
          queryClient.invalidateQueries(queryKey);
        }}
        openDrawModal={openCollectionModal}
        setOpenDrawModal={setOpenCollectionModal}
        drawing={drawing}
      />
    </Fragment>
  );
};
export default DrawingCard;
