import { AccessControl } from "accesscontrol";

let grantsObject: Object = {
  basic: {
    post: {
      "read:any": ["*", "!id"],
    },
  },
  user: {
    post: {
      "create:own": ["*"],
      "read:any": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
    },
  },
  admin: {
    post: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
  },
};

const ac = new AccessControl(grantsObject);
