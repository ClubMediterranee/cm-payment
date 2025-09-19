import { Icon } from "@clubmed/trident-ui/atoms/Icons";
import { Breadcrumb } from "@clubmed/trident-ui/molecules/Breadcrumb";
import { useAppContext } from "../hooks/useAppContext";
import { useSearch } from "wouter";

export const Header = () => {
  const { type, id } = useAppContext();
  const search = useSearch();
  const backUrl = new URLSearchParams(search).get("back_url");

  return (
    <div className="w-full">
      <header
        className="bg-white p-4 shadow-md flex items-center justify-center border-b border-saffron"
        style={{ height: 60 }}
      >
        <div
          className="flex justify-between items-center font-semibold flex-row-reverse"
          style={{ width: 1200 }}
        >
          <Icon name="ClubMed" height={120} width={120} />
          <span className="flex justify-center items-center">
            {type?.toUpperCase()} {id}
          </span>
        </div>
      </header>
      <div className="p-8">
        <Breadcrumb
          items={
            backUrl
              ? [
                  {
                    href: backUrl || "#",
                    label: "Retour",
                  },
                  {
                    href: "#",
                    label: "Payment",
                  },
                ]
              : []
          }
        />
      </div>
    </div>
  );
};
