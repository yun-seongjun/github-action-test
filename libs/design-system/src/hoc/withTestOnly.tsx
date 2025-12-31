import { EnvUtils } from '@design-system/utils';

const withTestOnly = (Component: React.ComponentType) => {
  const TestOnlyWrapper = <P extends Record<string, any>>(props: P) => {
    if (!EnvUtils.isTestMode()) {
      return null;
    }

    return <Component {...props} />;
  };

  return TestOnlyWrapper;
};

export default withTestOnly;
