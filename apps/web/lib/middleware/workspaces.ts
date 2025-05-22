import { UserProps } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "./utils";
import { getDefaultWorkspace } from "./utils/get-default-workspace";
import { isTopLevelSettingsRedirect } from "./utils/is-top-level-settings-redirect";

export default async function WorkspacesMiddleware(
  req: NextRequest,
  user: UserProps,
) {
  const { path, searchParamsObj, searchParamsString } = parse(req);

  // special case for handling ?next= query param
  // only redirect if next is a valid relative path (not an absolute URL)
  if (searchParamsObj.next && searchParamsObj.next.startsWith("/")) {
    return NextResponse.redirect(new URL(searchParamsObj.next, req.url));
  }

  const defaultWorkspace = await getDefaultWorkspace(user);

  if (defaultWorkspace) {
    let redirectPath = path;
    if (["/", "/login", "/register", "/workspaces"].includes(path)) {
      redirectPath = "";
    } else if (isTopLevelSettingsRedirect(path)) {
      redirectPath = `/settings/${path}`;
    }
    return NextResponse.redirect(
      new URL(
        `/${defaultWorkspace}${redirectPath || "/links"}${searchParamsString}`,
        req.url,
      ),
    );
  } else {
    return NextResponse.redirect(new URL("/onboarding/workspace", req.url));
  }
}
