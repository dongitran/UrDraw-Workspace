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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDrawing, deleteDrawing, updateDrawing } from "@/lib/api";
import { generateRandomThumbnail } from "@/lib/thumbnailGenerator";
import { LoaderCircle } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

const DrawingModal = ({ collectionId, drawing = {}, refetch, openDrawModal, setOpenDrawModal }) => {
  const [name, setName] = useState();
  const [type, setType] = useState();
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
        type,
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
      setLoading(true);
      await updateDrawing(drawing.id, {
        name,
      });
      setOpenDrawModal(null);
      setName("");
      if (refetch) refetch();
      toast.success("Edit drawing name successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Edit drawing name failed");
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async () => {
    if (!drawing.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      setLoading(true);
      await deleteDrawing(drawing.id);
      setOpenDrawModal(null);
      if (refetch) refetch();
      toast.success("Delete drawing successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Delete drawing failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (drawing.name) {
      setName(drawing.name);
    }
    if (drawing.type) {
      setType(drawing.type);
    }
  }, [drawing]);
  if (openDrawModal === "delete") {
    return (
      <Fragment>
        <Dialog open={!!openDrawModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete drawing</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenDrawModal) setOpenDrawModal();
                }}
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button disabled={loading} onClick={onDelete} variant="destructive">
                {loading && <LoaderCircle className="animate-spin" />}
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
              <DialogTitle>Edit drawing name</DialogTitle>
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
                className="bg-slate-700 hover:bg-slate-900 text-white"
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button disabled={loading} onClick={onEdit} className="bg-green-700 hover:bg-green-900 text-white">
                {loading && <LoaderCircle className="animate-spin" />}
                Save
              </Button>
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
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="type" className="">
                  Type
                </Label>
                <Select onValueChange={(e) => setType(e)}>
                  <SelectTrigger id="type" className="">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excalidraw">Excalidraw</SelectItem>
                    <SelectItem value="mermaid">Mermaid</SelectItem>
                  </SelectContent>
                </Select>
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
