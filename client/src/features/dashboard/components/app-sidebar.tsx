import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Link, linkOptions } from "@tanstack/react-router";
import NavUser from "@/components/nav-user";

const options = [
  linkOptions({
    to: "/dashboard/home/overview",
    label: "Principal",
  }),
  linkOptions({
    to: "/dashboard/finances/budgets",
    label: "Finanzas",
  }),
  linkOptions({
    to: "/dashboard/setup/accounts",
    label: "Ajustes",
  }),
];

const data = {
  navMain: [
    {
      title: "Principal",
      url: "#",
      items: [
        {
          title: "Resumen",
          url: "/dashboard/home/overview",
          isActive: false,
        },
        {
          title: "Patrimonio",
          url: "/dashboard/home/net-worth",
        },
        {
          title: "Estadisticas",
          url: "/dashboard/home/stats",
        },
      ],
    },
    {
      title: "Finanzas",
      url: "#",
      items: [
        {
          title: "Presupuessto",
          url: "/dashboard/finances/budgets",
        },
        {
          title: "Transacciones",
          url: "/dashboard/finances/transactions",
        },
      ],
    },
    {
      title: "Configuracion",
      url: "#",
      items: [
        {
          title: "Cuentas",
          url: "/dashboard/setup/accounts",
        },
        {
          title: "Categorias",
          url: "/dashboard/setup/categories",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Ohtli</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <Link to={item.url}>{item.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
