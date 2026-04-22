/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as budget from "../budget.js";
import type * as expenses from "../expenses.js";
import type * as growthAssumptions from "../growthAssumptions.js";
import type * as lib_lookupUtils from "../lib/lookupUtils.js";
import type * as lib_ownership from "../lib/ownership.js";
import type * as submissions from "../submissions.js";
import type * as takeHome_getCachedResult from "../takeHome/getCachedResult.js";
import type * as takeHome_getResult from "../takeHome/getResult.js";
import type * as takeHome_storeResult from "../takeHome/storeResult.js";
import type * as userProfile from "../userProfile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  budget: typeof budget;
  expenses: typeof expenses;
  growthAssumptions: typeof growthAssumptions;
  "lib/lookupUtils": typeof lib_lookupUtils;
  "lib/ownership": typeof lib_ownership;
  submissions: typeof submissions;
  "takeHome/getCachedResult": typeof takeHome_getCachedResult;
  "takeHome/getResult": typeof takeHome_getResult;
  "takeHome/storeResult": typeof takeHome_storeResult;
  userProfile: typeof userProfile;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
