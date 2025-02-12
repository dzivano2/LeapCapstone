/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/AdminDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/AuthContext`; params?: Router.UnknownInputParams; } | { pathname: `/EmployeeDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/Home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/ProtectedRoute`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/UserDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/Queue/QueuePage`; params?: Router.UnknownInputParams; } | { pathname: `/Users/BottomNavBar`; params?: Router.UnknownInputParams; } | { pathname: `/Users/profile`; params?: Router.UnknownInputParams; } | { pathname: `/Users/UserLayout`; params?: Router.UnknownInputParams; } | { pathname: `/Bars/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Bars/[barId]/ManageEmployees`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Bars/[barId]/ManageQueue`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Queue/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Queue/Waiting/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/AdminDashboard`; params?: Router.UnknownOutputParams; } | { pathname: `/AuthContext`; params?: Router.UnknownOutputParams; } | { pathname: `/EmployeeDashboard`; params?: Router.UnknownOutputParams; } | { pathname: `/Home`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/ProtectedRoute`; params?: Router.UnknownOutputParams; } | { pathname: `/signup`; params?: Router.UnknownOutputParams; } | { pathname: `/UserDashboard`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/Queue/QueuePage`; params?: Router.UnknownOutputParams; } | { pathname: `/Users/BottomNavBar`; params?: Router.UnknownOutputParams; } | { pathname: `/Users/profile`; params?: Router.UnknownOutputParams; } | { pathname: `/Users/UserLayout`; params?: Router.UnknownOutputParams; } | { pathname: `/Bars/[barId]`, params: Router.UnknownOutputParams & { barId: string; } } | { pathname: `/Bars/[barId]/ManageEmployees`, params: Router.UnknownOutputParams & { barId: string; } } | { pathname: `/Bars/[barId]/ManageQueue`, params: Router.UnknownOutputParams & { barId: string; } } | { pathname: `/Queue/[barId]`, params: Router.UnknownOutputParams & { barId: string; } } | { pathname: `/Queue/Waiting/[barId]`, params: Router.UnknownOutputParams & { barId: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/AdminDashboard${`?${string}` | `#${string}` | ''}` | `/AuthContext${`?${string}` | `#${string}` | ''}` | `/EmployeeDashboard${`?${string}` | `#${string}` | ''}` | `/Home${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/ProtectedRoute${`?${string}` | `#${string}` | ''}` | `/signup${`?${string}` | `#${string}` | ''}` | `/UserDashboard${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/Queue/QueuePage${`?${string}` | `#${string}` | ''}` | `/Users/BottomNavBar${`?${string}` | `#${string}` | ''}` | `/Users/profile${`?${string}` | `#${string}` | ''}` | `/Users/UserLayout${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/AdminDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/AuthContext`; params?: Router.UnknownInputParams; } | { pathname: `/EmployeeDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/Home`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/ProtectedRoute`; params?: Router.UnknownInputParams; } | { pathname: `/signup`; params?: Router.UnknownInputParams; } | { pathname: `/UserDashboard`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/Queue/QueuePage`; params?: Router.UnknownInputParams; } | { pathname: `/Users/BottomNavBar`; params?: Router.UnknownInputParams; } | { pathname: `/Users/profile`; params?: Router.UnknownInputParams; } | { pathname: `/Users/UserLayout`; params?: Router.UnknownInputParams; } | `/Bars/${Router.SingleRoutePart<T>}` | `/Bars/${Router.SingleRoutePart<T>}/ManageEmployees` | `/Bars/${Router.SingleRoutePart<T>}/ManageQueue` | `/Queue/${Router.SingleRoutePart<T>}` | `/Queue/Waiting/${Router.SingleRoutePart<T>}` | { pathname: `/Bars/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Bars/[barId]/ManageEmployees`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Bars/[barId]/ManageQueue`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Queue/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } } | { pathname: `/Queue/Waiting/[barId]`, params: Router.UnknownInputParams & { barId: string | number; } };
    }
  }
}
