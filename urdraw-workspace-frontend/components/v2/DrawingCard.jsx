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
          <ContextMenuItem inset onClick={() => handleClickMenu("edit")}>
            Edit Name
            <ContextMenuShortcut>
              <Pen className="h-4 w-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset onClick={() => handleClickMenu("delete")}>
            Delete Collection
            <ContextMenuShortcut>
              <Trash2 className="h-4 w-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            Share
            <ContextMenuShortcut>
              <Share2 className="h-4 w-4" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                Save Page As...
                <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>Create Shortcut...</ContextMenuItem>
              <ContextMenuItem>Name Window...</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Developer Tools</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>
            Show Bookmarks Bar
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value="pedro">
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
      <DrawingModal
        refetch={() => {
          queryClient.invalidateQueries(queryKey);
        }}
        openCollectionModal={openCollectionModal}
        setOpenCollectionModal={setOpenCollectionModal}
        collection={drawing}
      />
    </Fragment>
  );
};
export default DrawingCard;
