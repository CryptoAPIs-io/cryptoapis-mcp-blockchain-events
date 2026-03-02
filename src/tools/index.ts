import { systemInfoTool } from "@cryptoapis-io/mcp-shared";
import { blockchainEventsManageTool } from "./manage/index.js";
import { blockchainEventsCreateTool } from "./create/index.js";

export const tools = [blockchainEventsManageTool, blockchainEventsCreateTool, systemInfoTool] as const;
