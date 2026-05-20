"use client";

import { useMerkliste } from "./MerklisteProvider";

type Props = {
  id: string;
  code: string;
  name: string;
  image: string | null;
  labelOn: string;
  labelOff: string;
};

/** Knopf auf der Produktseite, um den Artikel auf den Merkzettel zu setzen. */
export default function MerkenButton({
  id,
  code,
  name,
  image,
  labelOn,
  labelOff,
}: Props) {
  const { has, toggle } = useMerkliste();
  const merkt = has(id);

  return (
    <button
      type="button"
      className={`btn merken-btn${merkt ? " is-merkt" : ""}`}
      onClick={() => toggle({ id, code, name, image })}
    >
      {merkt ? labelOn : labelOff}
    </button>
  );
}
