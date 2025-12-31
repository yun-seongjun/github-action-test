import { EnvUtils } from '@design-system/utils';

const withDevOnly = (Component: React.ComponentType) => {
  const DevOnlyWrapper = <P extends Record<string, any>>(props: P) => {
    if (!EnvUtils.isDevMode()) {
      return null;
    }

    return <Component {...props} />;
  };

  return DevOnlyWrapper;
};

export default withDevOnly;
