const { Fragment, useState } = require("react");
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
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
import { Pen, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CollectionModal from "@/components/v2/CollectionModal";
import { useQueryClient } from "@tanstack/react-query";

const CollectionCard = ({ queryKey, collection = {} }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [openCollectionModal, setOpenCollectionModal] = useState("");
  const handleClickMenu = async (type) => {
    setOpenCollectionModal(type);
  };
  return (
    <Fragment>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            className="@container/card rounded-sm shadow-lg hover:shadow-slate-700"
            onDoubleClick={() => {
              router.push(`/workspace-v2/collection/${collection.id}`);
            }}
          >
            <CardHeader className="relative">
              <CardDescription>Total Drawing</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {collection.name}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="" className="flex gap-1 rounded-lg text-xs">
                  {collection.drawingCount || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="font-medium truncate w-full">{collection.userId}</div>
              <div className="text-muted-foreground text-xs">
                {dayjs(collection.createdAt).format("HH:mm - DD/MM/YYYY")}
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
          <ContextMenuItem inset onClick={() => handleClickMenu("share")}>
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
      <CollectionModal
        refetch={() => {
          queryClient.invalidateQueries(queryKey);
        }}
        openCollectionModal={openCollectionModal}
        setOpenCollectionModal={setOpenCollectionModal}
        collection={collection}
      />
    </Fragment>
  );
};
export default CollectionCard;
