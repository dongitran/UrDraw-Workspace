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

const WorkspaceModal = ({ openWorkspaceModal, setOpenWorkspaceModal }) => {
  const useClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
};
export default WorkspaceModal;
