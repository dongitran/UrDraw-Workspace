"use client";
import { Button } from "@/components/ui/button";
import DrawingCard from "@/components/v2/DrawingCard";
import DrawingModal from "@/components/v2/DrawingModal";
import { fetchCollectionDrawings } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { castArray, compact, get } from "lodash";
import { useParams } from "next/navigation";
import { Fragment, useState } from "react";

const CollectionPage = () => {
  const { id } = useParams();
  const [openDrawModal, setOpenDrawModal] = useState();
  const queryKey = ["drawings" + id];
  const { data, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      return fetchCollectionDrawings(id);
    },
  });
  return (
    <Fragment>
      <div className="flex gap-3">
        <div className="ml-auto"></div>
        <Button
          onClick={() => {
            setOpenDrawModal("create");
          }}
        >
          Create drawing
        </Button>
      </div>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3">
        {castArray(compact(get(data, "drawings"))).map((drawing) => {
          return <DrawingCard queryKey={queryKey} drawing={drawing} />;
        })}
      </div>
      <DrawingModal
        refetch={refetch}
        collectionId={id}
        openDrawModal={openDrawModal}
        setOpenDrawModal={setOpenDrawModal}
      />
    </Fragment>
  );
};
export default CollectionPage;
