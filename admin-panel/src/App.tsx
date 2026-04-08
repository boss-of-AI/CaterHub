import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useNotificationProvider, ThemedLayout, ErrorComponent } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { App as AntdApp } from "antd";

import { Toaster } from "react-hot-toast";
import NotificationListener from "./components/NotificationListener";

import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
  NavigateToResource,
} from "@refinedev/react-router";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import { ColorModeContextProvider } from "./contexts/color-mode";
import { dataProvider } from "./providers/data";
import { authProvider } from "./authProvider";

import { CatererList } from "./pages/caterers/list";
import { CatererCreate } from "./pages/caterers/create";
import { CatererEdit } from "./pages/caterers/edit";

import { MenuList } from "./pages/menus/list";
import { MenuCreate } from "./pages/menus/create";
import { MenuEdit } from "./pages/menus/edit";

import { OrderList } from "./pages/orders/list";
import { SentToCaterersList } from "./pages/orders/sent";
import { ApprovedList } from "./pages/orders/approved";
import { OrderCreate } from "./pages/orders/create";
import { Login } from "./pages/login";

import { SkeletonList } from "./pages/skeletons/list";
import { SkeletonCreate } from "./pages/skeletons/create";
import { SkeletonEdit } from "./pages/skeletons/edit";
import { DishList } from "./pages/dishes/list";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Toaster />
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                authProvider={authProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                resources={[
                  {
                    name: "caterers",
                    list: "/caterers",
                    create: "/caterers/create",
                    edit: "/caterers/edit/:id",
                    meta: { label: "Caterers", canDelete: true },
                  },
                  {
                    name: "menus",
                    list: "/menus",
                    create: "/menus/create",
                    edit: "/menus/edit/:id",
                    meta: { label: "Menus" },
                  },
                  {
                    name: "booking-requests",
                    list: "/requests",
                    create: "/requests/create",
                    meta: { label: "Booking Requests", resource: "orders" },
                  },
                  {
                    name: "sent-to-caterers",
                    list: "/sent",
                    meta: { label: "Sent to Caterers", resource: "orders" },
                  },
                  {
                    name: "approved-bookings",
                    list: "/approved",
                    meta: { label: "Approved Bookings", resource: "orders" },
                  },
                  {
                    name: "skeletons",
                    list: "/skeletons",
                    create: "/skeletons/create",
                    edit: "/skeletons/edit/:id",
                    meta: { label: "Menu Skeletons" },
                  },
                  {
                    name: "dishes",
                    list: "/dishes",
                    meta: { label: "Dish Library", parent: "skeletons" },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "aVSNsN-L54h9P-MvuDpU",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout>
                          <NotificationListener />
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<NavigateToResource resource="caterers" />} />

                    <Route path="/caterers">
                      <Route index element={<CatererList />} />
                      <Route path="create" element={<CatererCreate />} />
                      <Route path="edit/:id" element={<CatererEdit />} />
                    </Route>

                    <Route path="/menus">
                      <Route index element={<MenuList />} />
                      <Route path="create" element={<MenuCreate />} />
                      <Route path="edit/:id" element={<MenuEdit />} />
                    </Route>

                    <Route path="/requests">
                      <Route index element={<OrderList />} />
                      <Route path="create" element={<OrderCreate />} />
                    </Route>

                    <Route path="/sent">
                      <Route index element={<SentToCaterersList />} />
                    </Route>

                    <Route path="/approved">
                      <Route index element={<ApprovedList />} />
                    </Route>

                    <Route path="/skeletons">
                      <Route index element={<SkeletonList />} />
                      <Route path="create" element={<SkeletonCreate />} />
                      <Route path="edit/:id" element={<SkeletonEdit />} />
                    </Route>

                    <Route path="/dishes" element={<DishList />} />

                  </Route>

                  <Route
                    element={
                      <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                        <NavigateToResource resource="caterers" />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated key="authenticated-error">
                        <ThemedLayout>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
