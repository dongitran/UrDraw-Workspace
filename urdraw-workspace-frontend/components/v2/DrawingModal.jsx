import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDrawing, deleteCollection, updateCollection } from "@/lib/api";
import { generateRandomThumbnail } from "@/lib/thumbnailGenerator";
import { LoaderCircle } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

const DrawingModal = ({ collectionId, drawing = {}, refetch, openDrawModal, setOpenDrawModal }) => {
  const [name, setName] = useState(drawing.name);
  const [loading, setLoading] = useState(false);
  const onSave = async () => {
    if (!collectionId) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      setLoading(true);
      await createDrawing({
        name,
        collectionId,
        thumbnailUrl: generateRandomThumbnail(name),
        content: JSON.stringify({
          type: "excalidraw",
          version: 2,
          source: "urdraw-workspace",
          elements: [],
        }),
      });
      setOpenDrawModal(null);
      setName("");
      if (refetch) refetch();
      toast.success("Create new drawing successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Create new drawing failed");
    } finally {
      setLoading(false);
    }
  };
  const onEdit = async () => {
    if (!drawing.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      await updateCollection(drawing.id, {
        name,
      });
      setOpenDrawModal(null);
      setName("");
      if (refetch) refetch();
      toast.success("Edit collection name successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Edit collection name failed");
    }
  };
  const onDelete = async () => {
    if (!drawing.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      await deleteCollection(drawing.id);
      setOpenDrawModal(null);
      if (refetch) refetch();
      toast.success("Delete collection name successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Delete collection name failed");
    }
  };
  if (openDrawModal === "delete") {
    return (
      <Fragment>
        <Dialog open={!!openDrawModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete collection</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenDrawModal) setOpenDrawModal();
                }}
              >
                Close
              </Button>
              <Button onClick={onDelete} variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openDrawModal === "edit") {
    return (
      <Fragment>
        <Dialog open={!!openDrawModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit collection name</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="">
                  Name
                </Label>
                <Input
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                  id="name"
                  className="col-span-3"
                  placeholder="Enter collection name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenDrawModal) setOpenDrawModal();
                }}
              >
                Close
              </Button>
              <Button onClick={onEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openDrawModal === "create") {
    return (
      <Fragment>
        <Dialog open={!!openDrawModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new drawing</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="">
                  Name
                </Label>
                <Input
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                  id="name"
                  className="col-span-3"
                  placeholder="Enter drawing name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenDrawModal) setOpenDrawModal();
                }}
                disabled={loading}
                className="bg-slate-700 hover:bg-slate-900 text-white"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                {"Đóng"}
              </Button>
              <Button onClick={onSave} disabled={loading} className="text-white bg-green-700 hover:bg-green-900">
                {loading && <LoaderCircle className="animate-spin" />}
                {"Lưu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openDrawModal === "join") {
    return (
      <Fragment>
        <Dialog open={!!openDrawModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join Collection</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="">
                  Invite Code
                </Label>
                <Input id="name" className="col-span-3" placeholder="Enter invite code" />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={loading}
                onClick={() => {
                  if (setOpenDrawModal) setOpenDrawModal();
                }}
              >
                Close
              </Button>
              <Button onClick={onSave} disabled={loading}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
};
export default DrawingModal;
