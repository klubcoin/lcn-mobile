import { init } from '@sentry/react-native';
import { Dedupe, ExtraErrorData } from '@sentry/integrations';

const METAMASK_ENVIRONMENT = process.env['METAMASK_ENVIRONMENT'] || 'local'; // eslint-disable-line dot-notation
const SENTRY_DSN_PROD = 'https://87cae134ccd311ebaafc560a7eb79c14@sentry.io/2299799'; // metamask-mobile
const SENTRY_DSN_DEV = 'https://87cae134ccd311ebaafc560a7eb79c14@sentry.io/2651591'; // test-metamask-mobile

// Setup sentry remote error reporting
export default function setupSentry() {
	const environment = __DEV__ || !METAMASK_ENVIRONMENT ? 'development' : METAMASK_ENVIRONMENT;
	const dsn = environment === 'production' ? SENTRY_DSN_PROD : SENTRY_DSN_DEV;
	init({
		dsn,
		debug: __DEV__,
		environment,
		integrations: [new Dedupe(), new ExtraErrorData()]
	});
}
