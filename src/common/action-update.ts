export function getUpdateObjectByAction(action: string): any {
  let result: any;
  switch (action) {
    case 'ACTIVE': {
      result = {
        activeFlag: true,
        modifiedAt: new Date(),
      };
      break;
    }
    case 'INACTIVE': {
      result = {
        activeFlag: false,
        modifiedAt: new Date(),
      };
      break;
    }
    case 'DELETE': {
      result = {
        deleteFlag: true,
        modifiedAt: new Date(),
      };
      break;
    }
    default: {
      result = {};
      break;
    }
  }
  return result;
}
