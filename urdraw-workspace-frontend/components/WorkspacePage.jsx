"use client";
import { ComboboxDemo } from "@/components/Combobox";
import CollectionCard from "@/components/v2/CollectionCard";
import { fetchUserCollections, WorkspaceApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { castArray, compact, get } from "lodash";
import { Fragment, useState } from "react";
import { Button } from "./ui/button";
import CollectionModal from "./v2/CollectionModal";
import { useParams } from "next/navigation";
export function WorkspacePage() {
  const { id } = useParams();
  const [openCollectionModal, setOpenCollectionModal] = useState("");
  const queryKey = ["/workspaces/" + id];
  const { data, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      return WorkspaceApi().detail(id);
    },
  });

  return (
    <Fragment>
      <div className="flex gap-3 ">
        <ComboboxDemo />
        <div className="ml-auto"></div>
        <Button
          onClick={() => {
            setOpenCollectionModal("join");
          }}
        >
          Join Collection
        </Button>
        <Button
          onClick={() => {
            setOpenCollectionModal("create");
          }}
        >
          Create Collection
        </Button>
      </div>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3">
        {castArray(compact(get(data, "collections"))).map((collection) => {
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
