import { Fragment, useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CollectionShareApi, createCollection, deleteCollection, updateCollection } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CopyCheck, LoaderCircle } from "lucide-react";
import { castArray, compact, get } from "lodash";
import dayjs from "dayjs";

const CollectionModal = ({ collection = {}, workspace = {}, refetch, openCollectionModal, setOpenCollectionModal }) => {
  const [name, setName] = useState();
  const [permission, setPermission] = useState();
  const [expiresIn, setExpiresIn] = useState();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState();
  const [isCopied, setIsCopied] = useState(false);

  const onSave = async () => {
    if (!workspace.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      await createCollection({ workspaceId: workspace.id, name });
      setOpenCollectionModal(null);
      setName("");
      if (refetch) refetch();
      toast.success("Create new collection successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Create new collection failed");
    } finally {
    }
  };
  const onEdit = async () => {
    if (!collection.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      await updateCollection(collection.id, {
        name,
      });
      setOpenCollectionModal(null);
      setName("");
      if (refetch) refetch();
      toast.success("Edit collection name successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Edit collection name failed");
    }
  };
  const onDelete = async () => {
    if (!collection.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      await deleteCollection(collection.id);
      setOpenCollectionModal(null);
      if (refetch) refetch();
      toast.success("Delete collection name successfully");
    } catch (error) {
      console.log("error :>> ", error);
      toast.error("Delete collection name failed");
    }
  };
  const onShareCollection = async () => {
    if (!permission || !expiresIn) {
      toast.warning("Giá trị chưa đầy đủ để tạo");
      return;
    } else if (!collection.id) {
      toast.warning("Mã ID của collection không được tìm thấy");
      return;
    }
    try {
      setLoading(true);
      const res = await CollectionShareApi().createInviteCode({
        type: "collection",
        permission,
        expiresIn: expiresIn,
        relatedId: collection.id,
      });
      if (res && res.code) {
        setInviteCode(res.code);
      }
      toast.success("Đã tạo mã invite thành công");
    } catch (error) {
      toast.error("Có lỗi khi tạo code invite");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collection.inviteCode) setInviteCode(collection.inviteCode);
    if (collection.name) setName(collection.name);
  }, [collection]);

  if (openCollectionModal === "share") {
    return (
      <Fragment>
        <Dialog open={!!openCollectionModal}>
          <DialogContent className="sm:max-w-[475px]">
            <DialogHeader>
              <DialogTitle>Share collection</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="create" className="">
              <TabsList className="w-full">
                <TabsTrigger value="create" className="w-1/2">
                  Create Invite
                </TabsTrigger>
                <TabsTrigger value="manage" className="w-1/2">
                  Manage
                </TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <div className="grid gap-4 py-4">
                  <Fragment>
                    <div className="grid grid-cols-1 items-center gap-4">
                      <Label htmlFor="name" className="">
                        Permission
                      </Label>
                      <Select onValueChange={(e) => setPermission(e)}>
                        <SelectTrigger id="name" className="">
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 items-center gap-4">
                      <Label htmlFor="expired_in" className="">
                        Expires in
                      </Label>
                      <Select onValueChange={(e) => setExpiresIn(e)}>
                        <SelectTrigger id="expired_in" className="">
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-day">1 Day</SelectItem>
                          <SelectItem value="7-day">7 Day</SelectItem>
                          <SelectItem value="30-day">30 Day</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Fragment>
                </div>
                {inviteCode && (
                  <Fragment>
                    <div className="border rounded-sm p-3">
                      <p className="text-xs text-muted-foreground">Invite Code</p>
                      <div className="text-lg font-bold flex gap-3">
                        <span className="truncate w-52">{inviteCode}</span>
                        <div className="ml-auto"></div>
                        {isCopied ? (
                          <CopyCheck className="cursor-pointer" />
                        ) : (
                          <Copy
                            className="cursor-pointer"
                            onClick={async () => {
                              setIsCopied(true);
                              toast("Đã copy mã invite");
                              await navigator.clipboard.writeText(inviteCode);
                              setTimeout(() => {
                                setIsCopied(false);
                              }, 7000);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </Fragment>
                )}
              </TabsContent>
              <TabsContent value="manage">
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-auto">
                  {compact(castArray(collection.inviteCodes)).map((item) => {
                    return (
                      <div className="border rounded-sm p-3" key={item.id}>
                        <div className="text-xs text-muted-foreground">
                          Invite Code (<span className="capitalize">{get(item, "params.permission")}</span>)
                        </div>
                        <div className="text-lg font-bold flex gap-3">
                          <span className="truncate w-60">{item.id}</span>
                          <div className="ml-auto"></div>
                          {isCopied ? (
                            <CopyCheck className="cursor-pointer" />
                          ) : (
                            <Copy
                              className="cursor-pointer"
                              onClick={async () => {
                                setIsCopied(true);
                                toast("Đã copy mã invite");
                                await navigator.clipboard.writeText(inviteCode);
                                setTimeout(() => {
                                  setIsCopied(false);
                                }, 7000);
                              }}
                            />
                          )}
                        </div>
                        <p className="mt-1 text-xs font-medium text-muted-foreground/50">
                          Expires at: {dayjs().format("HH:mm DD/MM/YYYY")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenCollectionModal) setOpenCollectionModal();
                  setInviteCode(null);
                }}
                disabled={loading}
                variant="close"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Close
              </Button>
              <Button
                disabled={loading}
                onClick={onShareCollection}
                className="bg-green-700 text-white hover:bg-green-800"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openCollectionModal === "delete") {
    return (
      <Fragment>
        <Dialog open={!!openCollectionModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete collection</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                onClick={() => {
                  if (setOpenCollectionModal) setOpenCollectionModal();
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
  } else if (openCollectionModal === "edit") {
    return (
      <Fragment>
        <Dialog open={!!openCollectionModal}>
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
                  if (setOpenCollectionModal) setOpenCollectionModal();
                }}
                variant="close"
              >
                Close
              </Button>
              <Button onClick={onEdit} variant="success">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openCollectionModal === "create") {
    return (
      <Fragment>
        <Dialog open={!!openCollectionModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new collection</DialogTitle>
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
                  if (setOpenCollectionModal) setOpenCollectionModal();
                }}
                variant="close"
              >
                Close
              </Button>
              <Button onClick={onSave} variant="success">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else if (openCollectionModal === "join") {
    return (
      <Fragment>
        <Dialog open={!!openCollectionModal}>
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
                onClick={() => {
                  if (setOpenCollectionModal) setOpenCollectionModal();
                }}
              >
                Close
              </Button>
              <Button onClick={onSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
};
export default CollectionModal;
