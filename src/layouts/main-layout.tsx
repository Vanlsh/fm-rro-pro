import { Outlet, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { to: "/load", label: "Завантаження" },
  { to: "/meta", label: "Мета" },
  { to: "/serial", label: "Серійний номер" },
  { to: "/fm-numbers", label: "Номери ФМ" },
  { to: "/vat-rates", label: "Ставки ПДВ" },
  { to: "/ram-resets", label: "Скидання RAM" },
  { to: "/tax-records", label: "Податкові записи" },
  { to: "/test-records", label: "Тестові записи" },
  { to: "/z-reports", label: "Z-звіти" },
];

export function AppSidebar() {
  return (
    <Sidebar side="left" variant="inset">
      <SidebarHeader />
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Фіскальна пам'ять
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={false}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            isActive ? "text-primary" : ""
                          }
                        >
                          {item.label}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export const MainLayout = () => {
  return (
    <SidebarProvider defaultValue="open">
      <AppSidebar />
      <SidebarTrigger />
      <SidebarInset>
        <Card>
          <CardContent className="p-4">
            <Outlet />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
};
