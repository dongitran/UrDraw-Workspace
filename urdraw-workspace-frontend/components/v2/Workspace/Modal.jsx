const { Fragment, useState } = require("react");
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { WorkspaceApi } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const WorkspaceModal = ({ workspace = {}, openWorkspaceModal, setOpenWorkspaceModal }) => {
  const useClient = useQueryClient();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [loading, setLoading] = useState(false);
  const onCreateWorkspace = async () => {
    try {
      setLoading(true);
      await WorkspaceApi().post({ name, description });
      setDescription("");
      setName("");
      toast.success("Tạo workspace thành công");
      if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
      useClient.invalidateQueries(["/workspaces"]);
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Tạo workspace thất bại");
    } finally {
      setLoading(false);
    }
  };
  const onEditWorkspace = async () => {
    if (!workspace.id) {
      toast.error("Mã ID của workspace không được tìm thấy");
      return;
    }
    try {
      setLoading(true);
      await WorkspaceApi().patch(workspace.id, { name, description });
      setDescription("");
      setName("");
      toast.success("Chỉnh sửa workspace thành công");
      if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
      useClient.invalidateQueries(["/workspaces"]);
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Chỉnh sửa workspace thất bại");
    } finally {
      setLoading(false);
    }
  };
  const onDeleteWorkspace = async () => {
    if (!workspace.id) {
      toast.error("Mã ID của workspace không được tìm thấy");
      return;
    }
    try {
      setLoading(true);
      await WorkspaceApi().delete(workspace.id);
      setDescription("");
      setName("");
      toast.success("Xóa workspace thành công");
      if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
      useClient.invalidateQueries(["/workspaces"]);
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Xóa workspace thất bại");
    } finally {
      setLoading(false);
    }
  };
  if (openWorkspaceModal === "delete") {
    return (
      <Fragment>
        <Dialog open={!!openWorkspaceModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{"Delete Workspace"}</DialogTitle>
              <DialogDescription>
                Delete all collections and drawings in this Workspace. Are you sure you want to delete this Workspace?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
                }}
                disabled={loading}
                className="text-white bg-slate-700 hover:bg-slate-800"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button disabled={loading} onClick={onDeleteWorkspace} variant="destructive">
                {loading && <LoaderCircle className="animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openWorkspaceModal === "edit") {
    return (
      <Fragment>
        <Dialog open={!!openWorkspaceModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Sửa thông tin Workspace</DialogTitle>
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
                  placeholder="Enter workspace name"
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="">
                  Description
                </Label>
                <Textarea
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  value={description}
                  id="name"
                  className="col-span-3"
                  placeholder="Enter workspace name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
                }}
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button
                disabled={loading}
                onClick={onEditWorkspace}
                className="bg-green-700 hover:bg-green-900"
                variant="destructive"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openWorkspaceModal === "create") {
    return (
      <Fragment>
        <Dialog open={!!openWorkspaceModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create workspace</DialogTitle>
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
                  placeholder="Enter workspace name"
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name" className="">
                  Description
                </Label>
                <Textarea
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  value={description}
                  id="name"
                  className="col-span-3"
                  placeholder="Enter workspace name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenWorkspaceModal) setOpenWorkspaceModal(false);
                }}
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button
                disabled={loading}
                onClick={onCreateWorkspace}
                className="bg-green-700 hover:bg-green-900"
                variant="destructive"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
};
export default WorkspaceModal;
