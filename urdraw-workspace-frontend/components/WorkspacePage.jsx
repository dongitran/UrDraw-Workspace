"use client";
import { ComboboxDemo } from "@/components/Combobox";
import CollectionCard from "@/components/v2/CollectionCard";
import { WorkspaceApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { castArray, compact, get } from "lodash";
import { Fragment, useState } from "react";
import { Button } from "./ui/button";
import CollectionModal from "./v2/CollectionModal";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
export function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [openCollectionModal, setOpenCollectionModal] = useState("");
  const [value, setValue] = useState("");
  const queryKey = ["/workspaces/" + id];
  const { data, refetch, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      return WorkspaceApi().detail(id);
    },
    throwOnError: (error) => {
      const message = get(error, "response.data.message") || "Xảy ra lỗi trong quá trình lấy thông tin workspace";
      toast.error(message);
      router.push("/workspace-v2");
    },
  });
  if (isLoading || !data) return null;
  return (
    <Fragment>
      <div className="flex gap-3 ">
        <ComboboxDemo
          items={data.collections.map((item) => {
            return {
              value: item.name,
              label: item.name,
              type: item.type,
            };
          })}
          value={value}
          setValue={setValue}
        />
        <div className="ml-auto"></div>

        <Button
          onClick={() => {
            setOpenCollectionModal("create");
          }}
        >
          Create Collection
        </Button>
      </div>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3">
        {castArray(compact(get(data, "collections")))
          .filter((c) => {
            if (!value) return true;
            return c.name === value;
          })
          .map((collection) => {
            return <CollectionCard queryKey={queryKey} collection={collection} key={collection.id} />;
          })}
      </div>
      <CollectionModal
        workspace={data}
        refetch={refetch}
        openCollectionModal={openCollectionModal}
        setOpenCollectionModal={setOpenCollectionModal}
      />
    </Fragment>
  );
}
