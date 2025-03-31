"use client";
import { ComboboxDemo } from "@/components/Combobox";
import { fetchUserCollections } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { castArray, compact, get } from "lodash";
import { Button } from "./ui/button";
import CollectionCard from "@/components/v2/CollectionCard";
import { Fragment, useState } from "react";
import CollectionModal from "./v2/CollectionModal";

export function WorkspacePage() {
  const [openCollectionModal, setOpenCollectionModal] = useState("");
  const { data, refetch } = useQuery({
    queryKey: ["all/data"],
    queryFn: () => {
      return fetchUserCollections();
    },
  });

  return (
    <Fragment>
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
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
          {castArray(compact(data)).map((collection) => {
            return <CollectionCard collection={collection} key={collection.id} />;
          })}
        </div>
      </div>
      <CollectionModal
        refetch={refetch}
        openCollectionModal={openCollectionModal}
        setOpenCollectionModal={setOpenCollectionModal}
      />
    </Fragment>
  );
}
