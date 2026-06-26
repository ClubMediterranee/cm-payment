export interface BackendError {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	label: string;
	code?: string | null;
	description?: string | null;
}

export interface BackendProperty {
	/** @primaryKey */
	id: string;
	comments?: string | null;
	content_name?: string | null;
	sort?: number | null;
	path?: string | null;
	/** @required */
	route: BackendRoute | string;
	type?: PredefinedValue | string | null;
	source_file?: string | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
}

export interface BackendRoute {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	backend: PredefinedValue | string;
	/** @required */
	route: string;
	errors?: BackendRoutesBackendError[] | string[];
}

export interface BackendRoutesBackendError {
	/** @primaryKey */
	id: number;
	backend_routes_id?: BackendRoute | string | null;
	backend_errors_id?: BackendError | string | null;
}

export interface BackendRoutesPredefinedValue {
	/** @primaryKey */
	id: number;
	backend_routes_id?: string | null;
	predefined_values_id?: string | null;
}

export interface BlocksCard {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	icon?: string | null;
	translations?: BlocksCardsTranslation[] | null;
}

export interface BlocksCardsTranslation {
	/** @primaryKey */
	id: number;
	blocks_cards_id?: BlocksCard | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	description?: string | null;
}

export interface BlocksHerobanner {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	theme?: 'transparent' | 'ultramarine' | null;
	image?: DirectusFile | string | null;
	translations?: BlocksHerobannersTranslation[] | null;
	buttons?: BlocksHerobannersButton[] | string[];
	tags?: BlocksHerobannersTag[] | string[];
}

export interface BlocksHerobannersButton {
	/** @primaryKey */
	id: number;
	blocks_herobanners_id?: BlocksHerobanner | string | null;
	buttons_id?: Button | string | null;
	sort?: number | null;
}

export interface BlocksHerobannersItem {
	/** @primaryKey */
	id: number;
	blocks_herobanners_id?: BlocksHerobanner | string | null;
	item?: Button | string | null;
	collection?: string | null;
}

export interface BlocksHerobannersTag {
	/** @primaryKey */
	id: number;
	blocks_herobanners_id?: BlocksHerobanner | string | null;
	tags_id?: Tag | string | null;
}

export interface BlocksHerobannersTranslation {
	/** @primaryKey */
	id: number;
	blocks_herobanners_id?: BlocksHerobanner | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	subtitle?: string | null;
	summary?: string | null;
}

export interface BlocksSection {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	theme?: 'light' | 'transparent' | 'dark' | null;
	translations?: BlocksSectionsTranslation[] | null;
	buttons?: BlocksSectionsButton[] | string[];
	items?: BlocksSectionsItem[] | string[];
}

export interface BlocksSectionsButton {
	/** @primaryKey */
	id: number;
	blocks_sections_id?: BlocksSection | string | null;
	buttons_id?: Button | string | null;
	sort?: number | null;
}

export interface BlocksSectionsItem {
	/** @primaryKey */
	id: number;
	blocks_sections_id?: BlocksSection | string | null;
	item?: BlocksCard | Button | string | null;
	collection?: string | null;
	sort?: number | null;
}

export interface BlocksSectionsTranslation {
	/** @primaryKey */
	id: number;
	blocks_sections_id?: BlocksSection | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	summary?: string | null;
}

export interface Button {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	icon?: string | null;
	url?: string | null;
	is_custom_link?: boolean | null;
	theme?: 'solid' | 'outline' | null;
	variant?: 'pill' | 'circle' | null;
	size?: 'small' | 'medium' | 'large' | null;
	color?: 'saffron' | 'black' | 'darkGrey' | 'green' | 'lavender' | 'lightGrey' | 'lightSand' | 'marygold' | 'orange' | 'red' | 'sand' | 'sienna' | 'ultramarine' | 'verdigris' | 'wave' | 'white' | 'current' | null;
	translations?: ButtonsTranslation[] | null;
	target?: ButtonsTarget[] | string[];
}

export interface ButtonsTarget {
	/** @primaryKey */
	id: number;
	buttons_id?: Button | string | null;
	item?: Page | Scenario | Release | MigrationNote | string | null;
	collection?: string | null;
}

export interface ButtonsTranslation {
	/** @primaryKey */
	id: number;
	buttons_id?: Button | string | null;
	languages_code?: Language | string | null;
	label?: string | null;
	/** @description Alternative text for a link */
	alt?: string | null;
}

export interface CapsConfiguration {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: string | null;
	date_created?: string | null;
	user_updated?: string | null;
	date_updated?: string | null;
	/** @description Unique global configuration key consumed by CAPS services (snake_case). @required */
	key: string;
	/** @description Type of the default value. @required */
	type: 'boolean' | 'number' | 'string';
	/** @description Default value for this key. @required */
	value: 'json';
	/** @description Optional overrides of default value by locale and issuer (GM, GO, PARTNER). */
	overrides?: Array<{ locale: string; issuer: 'GM' | 'GO' | 'PARTNER'; value: string }> | null;
	/** @description Human-readable business intent and usage context. */
	description?: string | null;
}

export interface CapsProviderConfiguration {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: string | null;
	date_created?: string | null;
	user_updated?: string | null;
	date_updated?: string | null;
	/** @description Locale code sourced from Club Med locales API. @required */
	locale: string;
	display_type?: 'host_fields' | 'iframe' | 'redirect' | 'custom' | null;
	provider_id?: CapsProvider | string | null;
	requires_token?: boolean | null;
	requires_expiry_date?: boolean | null;
	settings?: Array<{ key: string; type: 'boolean' | 'number' | 'string'; value: string }> | null;
	requires_card_holder?: boolean | null;
	requires_contact_choice?: 'PARTNERS' | 'GO' | 'GM' | null;
}

export interface CapsProvider {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	default_display_type: 'hosted_fields' | 'iframe' | 'redirect' | 'custom';
	image_url?: string | null;
	category_payment_method?: 'credit_card' | 'brank_transfer' | 'direct_debit' | 'paypal' | 'buy_now_pay_later' | null;
	confirmation_strategy?: 'status' | 'notify' | null;
	settings?: CapsProviderConfiguration[] | string[];
}

export interface Channel {
	/** @primaryKey */
	id: string;
	/** @required */
	label: string;
}

export interface Language {
	/** @primaryKey */
	code: string;
	name?: string | null;
	direction?: 'ltr' | 'rtl' | null;
}

export interface MigrationNote {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	deprecated_since?: string | null;
	end_of_support_date?: string | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	number?: number | null;
	image?: DirectusFile | string | null;
	tags?: MigrationNotesTag[] | string[];
	/** @required */
	channels: MigrationNotesChannel[] | string[];
	translations?: MigrationNotesTranslation[] | null;
	related_routes?: MigrationNotesRoute[] | string[];
}

export interface MigrationNotesChannel {
	/** @primaryKey */
	id: number;
	migration_notes_id?: MigrationNote | string | null;
	channels_id?: Channel | string | null;
}

export interface MigrationNotesRoute {
	/** @primaryKey */
	id: number;
	migration_notes_id?: MigrationNote | string | null;
	routes_id?: Route | string | null;
	sort?: number | null;
}

export interface MigrationNotesTag {
	/** @primaryKey */
	id: number;
	migration_notes_id?: MigrationNote | string | null;
	tags_id?: Tag | string | null;
}

export interface MigrationNotesTranslation {
	/** @primaryKey */
	id: number;
	migration_notes_id?: MigrationNote | string | null;
	languages_code?: Language | string | null;
	description?: string | null;
	/** @required */
	title: string;
	seo_url?: string | null;
	summary?: string | null;
	subtitle?: string | null;
}

export interface OtaProductId {
	/** @description The OTA Product ID @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	ota?: Ota | string | null;
	product_id?: string | null;
}

export interface OtaRateId {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	ota: Ota | string;
	/** @required */
	rate_id: string;
}

export interface OtaRoomId {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	ota: Ota | string;
	/** @required */
	room_id: string;
}

export interface Ota {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	label?: string | null;
}

export interface Page {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	template?: 'page' | `custom-page` | `dynamic-page` | null;
	image?: DirectusFile | string | null;
	is_home?: boolean | null;
	blocks?: PagesBlock[] | string[];
	tags?: PagesTag[] | string[];
	translations?: PagesTranslation[] | null;
}

export interface PagesBlock {
	/** @primaryKey */
	id: number;
	pages_id?: Page | string | null;
	item?: BlocksSection | BlocksCard | BlocksHerobanner | Button | string | null;
	collection?: string | null;
	sort?: number | null;
}

export interface PagesTag {
	/** @primaryKey */
	id: number;
	pages_id?: Page | string | null;
	tags_id?: Tag | string | null;
}

export interface PagesTranslation {
	/** @primaryKey */
	id: number;
	pages_id?: Page | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	description?: string | null;
	summary?: string | null;
	seo_url?: string | null;
	subtitle?: string | null;
}

export interface PredefinedValue {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	label: string;
	/** @required */
	type: string;
}

export interface Release {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	related_versions?: 'json' | null;
	stats_deleted_routes?: number | null;
	stats_added_routes?: number | null;
	stats_updated_routes?: number | null;
	stats_deprecated_routes?: number | null;
	stats_fixed_bugs?: number | null;
	stats_new_features?: number | null;
	related_routes?: ReleasesRoute[] | string[];
	translations?: ReleasesTranslation[] | null;
	channels?: ReleasesChannel[] | string[];
	related_migration_notes?: ReleasesMigrationNote[] | string[];
	tags?: ReleasesTag[] | string[];
}

export interface ReleasesChannel {
	/** @primaryKey */
	id: number;
	releases_id?: Release | string | null;
	channels_id?: Channel | string | null;
}

export interface ReleasesMigrationNote {
	/** @primaryKey */
	id: number;
	releases_id?: Release | string | null;
	migration_notes_id?: MigrationNote | string | null;
}

export interface ReleasesRoute {
	/** @primaryKey */
	id: number;
	releases_id?: Release | string | null;
	routes_id?: Route | string | null;
}

export interface ReleasesTag {
	/** @primaryKey */
	id: number;
	releases_id?: Release | string | null;
	tags_id?: Tag | string | null;
}

export interface ReleasesTranslation {
	/** @primaryKey */
	id: number;
	releases_id?: Release | string | null;
	languages_code?: Language | string | null;
	notes?: string | null;
	summary?: string | null;
}

export interface RouteError {
	/** @primaryKey */
	id: string;
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	status_code: number;
	/** @required */
	label: string;
	description?: string | null;
}

export interface RouteInputProperty {
	/** @primaryKey */
	id: string;
	description?: string | null;
	sort?: number | null;
	deprecated?: boolean | null;
	/** @required */
	route_id: Route | string;
	/** @required */
	path: string;
	/** @required */
	in_type: PredefinedValue | string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	source_file?: string | null;
	targets?: RouteInputPropertiesBackendProperty[] | string[];
}

export interface RouteInputPropertiesBackendProperty {
	/** @primaryKey */
	id: number;
	route_input_properties_id?: RouteInputProperty | string | null;
	backend_properties_id?: BackendProperty | string | null;
}

export interface RouteInputPropertiesRouteInputProperty {
	/** @primaryKey */
	id: number;
	route_input_properties_id?: RouteInputProperty | string | null;
	related_route_input_properties_id?: RouteInputProperty | string | null;
}

export interface RouteOutputProperty {
	/** @primaryKey */
	id: string;
	/** @required */
	route_id: Route | string;
	description?: string | null;
	is_dynamic?: boolean;
	sort?: number | null;
	deprecated?: boolean | null;
	/** @required */
	path: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	out_type: PredefinedValue | string;
	source_file?: string | null;
	sources?: RouteOutputPropertiesBackendProperty[] | string[];
}

export interface RouteOutputPropertiesBackendProperty {
	/** @primaryKey */
	id: number;
	route_output_properties_id?: RouteOutputProperty | string | null;
	backend_properties_id?: BackendProperty | string | null;
}

export interface Route {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	/** @required */
	route: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	deprecated: boolean;
	tags?: RoutesTag[] | string[];
	translations?: RoutesTranslation[] | null;
	/** @description Response payload properties sent to our consumer */
	output_properties?: RouteOutputProperty[] | string[];
	input_properties?: RouteInputProperty[] | string[];
	errors?: RoutesRouteError[] | string[];
}

export interface RoutesRouteError {
	/** @primaryKey */
	id: number;
	routes_id?: Route | string | null;
	route_errors_id?: RouteError | string | null;
}

export interface RoutesTag {
	/** @primaryKey */
	id: number;
	routes_id?: Route | string | null;
	tags_id?: Tag | string | null;
}

export interface RoutesTranslation {
	/** @primaryKey */
	id: number;
	routes_id?: Route | string | null;
	languages_code?: Language | string | null;
	summary?: string | null;
	description?: string | null;
}

export interface ScenarioCategory {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	translations?: ScenarioCategoriesTranslation[] | null;
}

export interface ScenarioCategoriesTranslation {
	/** @primaryKey */
	id: number;
	scenario_categories_id?: ScenarioCategory | string | null;
	languages_code?: Language | string | null;
	description?: string | null;
	/** @required */
	title: string;
}

export interface Scenario {
	/** @primaryKey */
	id: string;
	flowchart?: boolean | null;
	category?: ScenarioCategory | string | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	status?: 'draft' | `ready-to-review` | `ready-to-publish` | 'published' | 'archived' | null;
	steps?: Step[] | string[];
	translations?: ScenariosTranslation[] | null;
	/** @required */
	channels: ScenariosChannel[] | string[];
	attachments?: ScenariosFile[] | string[];
	tags?: ScenariosTag[] | string[];
}

export interface ScenariosChannel {
	/** @primaryKey */
	id: number;
	scenarios_id?: Scenario | string | null;
	channels_id?: Channel | string | null;
}

export interface ScenariosFile {
	/** @primaryKey */
	id: number;
	scenarios_id?: Scenario | string | null;
	directus_files_id?: DirectusFile | string | null;
}

export interface ScenariosTag {
	/** @primaryKey */
	id: number;
	scenarios_id?: Scenario | string | null;
	tags_id?: Tag | string | null;
}

export interface ScenariosTranslation {
	/** @primaryKey */
	id: number;
	scenarios_id?: Scenario | string | null;
	languages_code?: Language | string | null;
	description?: string | null;
	/** @required */
	title: string;
	seo_url?: string | null;
	summary?: string | null;
	subtitle?: string | null;
}

export interface Step {
	/** @primaryKey */
	id: string;
	date_created?: string | null;
	date_updated?: string | null;
	/** @required */
	route: Route | string;
	scenario_id?: Scenario | string | null;
	sort?: number | null;
	required?: boolean | null;
	image?: DirectusFile | string | null;
	translations?: StepsTranslation[] | null;
}

export interface StepsTranslation {
	/** @primaryKey */
	id: number;
	steps_id?: Step | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	/** @required */
	description: string;
}

export interface Tag {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	translations?: TagsTranslation[] | null;
}

export interface TagsTranslation {
	/** @primaryKey */
	id: number;
	tags_id?: Tag | string | null;
	languages_code?: Language | string | null;
	/** @required */
	title: string;
	description?: string | null;
}

export interface DirectusActivity {
	/** @primaryKey */
	id: number;
	action?: string;
	user?: DirectusUser | string | null;
	timestamp?: string;
	ip?: string | null;
	user_agent?: string | null;
	collection?: string;
	item?: string;
	origin?: string | null;
	revisions?: DirectusRevision[] | string[];
}

export interface DirectusCollection {
	/** @primaryKey */
	collection: string;
	icon?: string | null;
	note?: string | null;
	display_template?: string | null;
	hidden?: boolean;
	singleton?: boolean;
	translations?: Array<{ language: string; translation: string; singular: string; plural: string }> | null;
	archive_field?: string | null;
	archive_app_filter?: boolean;
	archive_value?: string | null;
	unarchive_value?: string | null;
	sort_field?: string | null;
	accountability?: 'all' | 'activity' | null | null;
	color?: string | null;
	item_duplication_fields?: 'json' | null;
	sort?: number | null;
	group?: DirectusCollection | string | null;
	collapse?: string;
	preview_url?: string | null;
	versioning?: boolean;
}

export interface DirectusComment {
	/** @primaryKey */
	id: string;
	collection?: DirectusCollection | string;
	item?: string;
	comment?: string;
	date_created?: string | null;
	date_updated?: string | null;
	user_created?: DirectusUser | string | null;
	user_updated?: DirectusUser | string | null;
}

export interface DirectusField {
	/** @primaryKey */
	id: number;
	collection?: DirectusCollection | string;
	field?: string;
	special?: string[] | null;
	interface?: string | null;
	options?: 'json' | null;
	display?: string | null;
	display_options?: 'json' | null;
	readonly?: boolean;
	hidden?: boolean;
	sort?: number | null;
	width?: string | null;
	translations?: 'json' | null;
	note?: string | null;
	conditions?: 'json' | null;
	required?: boolean | null;
	group?: DirectusField | string | null;
	validation?: 'json' | null;
	validation_message?: string | null;
	searchable?: boolean;
}

export interface DirectusFile {
	/** @primaryKey */
	id: string;
	storage?: string;
	filename_disk?: string | null;
	filename_download?: string;
	title?: string | null;
	type?: string | null;
	folder?: DirectusFolder | string | null;
	uploaded_by?: DirectusUser | string | null;
	created_on?: string;
	modified_by?: DirectusUser | string | null;
	modified_on?: string;
	charset?: string | null;
	filesize?: number | null;
	width?: number | null;
	height?: number | null;
	duration?: number | null;
	embed?: string | null;
	description?: string | null;
	location?: string | null;
	tags?: string[] | null;
	metadata?: 'json' | null;
	focal_point_x?: number | null;
	focal_point_y?: number | null;
	tus_id?: string | null;
	tus_data?: 'json' | null;
	uploaded_on?: string | null;
}

export interface DirectusFolder {
	/** @primaryKey */
	id: string;
	name?: string;
	parent?: DirectusFolder | string | null;
}

export interface DirectusPreset {
	/** @primaryKey */
	id: number;
	bookmark?: string | null;
	user?: DirectusUser | string | null;
	role?: DirectusRole | string | null;
	collection?: string | null;
	search?: string | null;
	layout?: string | null;
	layout_query?: 'json' | null;
	layout_options?: 'json' | null;
	refresh_interval?: number | null;
	filter?: 'json' | null;
	icon?: string | null;
	color?: string | null;
	uuid?: string | null;
}

export interface DirectusRelation {
	/** @primaryKey */
	id: number;
	many_collection?: string;
	many_field?: string;
	one_collection?: string | null;
	one_field?: string | null;
	one_collection_field?: string | null;
	one_allowed_collections?: string[] | null;
	junction_field?: string | null;
	sort_field?: string | null;
	one_deselect_action?: string;
}

export interface DirectusRevision {
	/** @primaryKey */
	id: number;
	activity?: DirectusActivity | string;
	collection?: string;
	item?: string;
	data?: 'json' | null;
	delta?: 'json' | null;
	parent?: DirectusRevision | string | null;
	version?: DirectusVersion | string | null;
}

export interface DirectusRole {
	/** @primaryKey */
	id: string;
	/** @required */
	name: string;
	icon?: string;
	description?: string | null;
	parent?: DirectusRole | string | null;
	children?: DirectusRole[] | string[];
	policies?: string;
	users?: DirectusUser[] | string[];
}

export interface DirectusSettings {
	/** @primaryKey */
	id: number;
	project_name?: string;
	project_url?: string | null;
	project_color?: string;
	project_logo?: DirectusFile | string | null;
	public_foreground?: DirectusFile | string | null;
	public_background?: DirectusFile | string | null;
	public_note?: string | null;
	auth_login_attempts?: number | null;
	auth_password_policy?: null | `/^.{8,}$/` | `/(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{';'?>.<,])(?!.*\\s).*$/` | null;
	storage_asset_transform?: 'all' | 'none' | 'presets' | null;
	storage_asset_presets?: Array<{ key: string; fit: 'contain' | 'cover' | 'inside' | 'outside'; width: number; height: number; quality: number; withoutEnlargement: boolean; format: 'auto' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif'; transforms: 'json' }> | null;
	custom_css?: string | null;
	storage_default_folder?: DirectusFolder | string | null;
	basemaps?: Array<{ name: string; type: 'raster' | 'tile' | 'style'; url: string; tileSize: number; attribution: string }> | null;
	mapbox_key?: string | null;
	module_bar?: 'json' | null;
	project_descriptor?: string | null;
	default_language?: string;
	custom_aspect_ratios?: Array<{ text: string; value: number }> | null;
	public_favicon?: DirectusFile | string | null;
	default_appearance?: 'auto' | 'light' | 'dark';
	default_theme_light?: string | null;
	theme_light_overrides?: 'json' | null;
	default_theme_dark?: string | null;
	theme_dark_overrides?: 'json' | null;
	report_error_url?: string | null;
	report_bug_url?: string | null;
	report_feature_url?: string | null;
	public_registration?: boolean;
	public_registration_verify_email?: boolean;
	public_registration_role?: DirectusRole | string | null;
	public_registration_email_filter?: 'json' | null;
	visual_editor_urls?: Array<{ url: string }> | null;
	project_id?: string | null;
	mcp_enabled?: boolean;
	mcp_allow_deletes?: boolean;
	mcp_prompts_collection?: string | null;
	mcp_system_prompt_enabled?: boolean;
	mcp_system_prompt?: string | null;
	project_owner?: string | null;
	project_usage?: string | null;
	org_name?: string | null;
	product_updates?: boolean | null;
	project_status?: string | null;
	ai_openai_api_key?: string | null;
	ai_anthropic_api_key?: string | null;
	ai_system_prompt?: string | null;
	ai_google_api_key?: string | null;
	ai_openai_compatible_api_key?: string | null;
	ai_openai_compatible_base_url?: string | null;
	ai_openai_compatible_name?: string | null;
	ai_openai_compatible_models?: Array<{ id: string; name: string; context: number; output: number; attachment: boolean; reasoning: boolean; providerOptions: Record<string, any> }> | null;
	ai_openai_compatible_headers?: Array<{ header: string; value: string }> | null;
	ai_openai_allowed_models?: Array<`gpt-4o-mini` | `gpt-4.1-nano` | `gpt-4.1-mini` | `gpt-4.1` | `gpt-5-nano` | `gpt-5-mini` | `gpt-5` | `gpt-5.2` | `gpt-5.2-chat-latest` | `gpt-5.2-pro` | `gpt-5.4` | `gpt-5.4-pro`> | null;
	ai_anthropic_allowed_models?: Array<`claude-haiku-4-5` | `claude-sonnet-4-5` | `claude-opus-4-5` | `claude-sonnet-4-6` | `claude-opus-4-6`> | null;
	ai_google_allowed_models?: Array<`gemini-3-pro-preview` | `gemini-3-flash-preview` | `gemini-2.5-pro` | `gemini-2.5-flash` | `gemini-3.1-pro-preview` | `gemini-3.1-flash-lite-preview` | `gemini-2.5-flash-lite`> | null;
	collaborative_editing_enabled?: boolean;
}

export interface DirectusUser {
	/** @primaryKey */
	id: string;
	first_name?: string | null;
	last_name?: string | null;
	email?: string | null;
	password?: string | null;
	location?: string | null;
	title?: string | null;
	description?: string | null;
	tags?: string[] | null;
	avatar?: DirectusFile | string | null;
	language?: string | null;
	tfa_secret?: string | null;
	status?: 'draft' | 'invited' | 'unverified' | 'active' | 'suspended' | 'archived';
	role?: DirectusRole | string | null;
	token?: string | null;
	last_access?: string | null;
	last_page?: string | null;
	provider?: 'clubmed';
	external_identifier?: string | null;
	auth_data?: 'json' | null;
	email_notifications?: boolean | null;
	appearance?: null | 'auto' | 'light' | 'dark' | null;
	theme_dark?: string | null;
	theme_light?: string | null;
	theme_light_overrides?: 'json' | null;
	theme_dark_overrides?: 'json' | null;
	text_direction?: 'auto' | 'ltr' | 'rtl';
	policies?: string;
}

export interface DirectusDashboard {
	/** @primaryKey */
	id: string;
	name?: string;
	icon?: string;
	note?: string | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	color?: string | null;
	panels?: DirectusPanel[] | string[];
}

export interface DirectusPanel {
	/** @primaryKey */
	id: string;
	dashboard?: DirectusDashboard | string;
	name?: string | null;
	icon?: string | null;
	color?: string | null;
	show_header?: boolean;
	note?: string | null;
	type?: string;
	position_x?: number;
	position_y?: number;
	width?: number;
	height?: number;
	options?: 'json' | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
}

export interface DirectusNotification {
	/** @primaryKey */
	id: number;
	timestamp?: string | null;
	status?: string | null;
	recipient?: DirectusUser | string;
	sender?: DirectusUser | string | null;
	subject?: string;
	message?: string | null;
	collection?: string | null;
	item?: string | null;
}

export interface DirectusShare {
	/** @primaryKey */
	id: string;
	name?: string | null;
	collection?: DirectusCollection | string;
	item?: string;
	role?: DirectusRole | string | null;
	password?: string | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	date_start?: string | null;
	date_end?: string | null;
	times_used?: number | null;
	max_uses?: number | null;
}

export interface DirectusFlow {
	/** @primaryKey */
	id: string;
	name?: string;
	icon?: string | null;
	color?: string | null;
	status?: string;
	trigger?: string | null;
	options?: 'json' | null;
}

export interface DirectusTranslation {
	/** @primaryKey */
	id: string;
	/** @required */
	language: string;
	/** @required */
	key: string;
	/** @required */
	value: string;
}

export interface DirectusVersion {
	/** @primaryKey */
	id: string;
	key?: string;
	name?: string | null;
	collection?: DirectusCollection | string;
	item?: string;
	hash?: string | null;
	date_created?: string | null;
	date_updated?: string | null;
	user_created?: DirectusUser | string | null;
	user_updated?: DirectusUser | string | null;
	delta?: 'json' | null;
}

export interface Schema {
	backend_errors: BackendError[];
	backend_properties: BackendProperty[];
	backend_routes: BackendRoute[];
	backend_routes_backend_errors: BackendRoutesBackendError[];
	backend_routes_predefined_values: BackendRoutesPredefinedValue[];
	blocks_cards: BlocksCard[];
	blocks_cards_translations: BlocksCardsTranslation[];
	blocks_herobanners: BlocksHerobanner[];
	blocks_herobanners_buttons: BlocksHerobannersButton[];
	blocks_herobanners_items: BlocksHerobannersItem[];
	blocks_herobanners_tags: BlocksHerobannersTag[];
	blocks_herobanners_translations: BlocksHerobannersTranslation[];
	blocks_sections: BlocksSection[];
	blocks_sections_buttons: BlocksSectionsButton[];
	blocks_sections_items: BlocksSectionsItem[];
	blocks_sections_translations: BlocksSectionsTranslation[];
	buttons: Button[];
	buttons_target: ButtonsTarget[];
	buttons_translations: ButtonsTranslation[];
	caps_configurations: CapsConfiguration[];
	caps_provider_configurations: CapsProviderConfiguration[];
	caps_providers: CapsProvider[];
	channels: Channel[];
	languages: Language[];
	migration_notes: MigrationNote[];
	migration_notes_channels: MigrationNotesChannel[];
	migration_notes_routes: MigrationNotesRoute[];
	migration_notes_tags: MigrationNotesTag[];
	migration_notes_translations: MigrationNotesTranslation[];
	ota_product_ids: OtaProductId[];
	ota_rate_ids: OtaRateId[];
	ota_room_ids: OtaRoomId[];
	otas: Ota[];
	pages: Page[];
	pages_blocks: PagesBlock[];
	pages_tags: PagesTag[];
	pages_translations: PagesTranslation[];
	predefined_values: PredefinedValue[];
	releases: Release[];
	releases_channels: ReleasesChannel[];
	releases_migration_notes: ReleasesMigrationNote[];
	releases_routes: ReleasesRoute[];
	releases_tags: ReleasesTag[];
	releases_translations: ReleasesTranslation[];
	route_errors: RouteError[];
	route_input_properties: RouteInputProperty[];
	route_input_properties_backend_properties: RouteInputPropertiesBackendProperty[];
	route_input_properties_route_input_properties: RouteInputPropertiesRouteInputProperty[];
	route_output_properties: RouteOutputProperty[];
	route_output_properties_backend_properties: RouteOutputPropertiesBackendProperty[];
	routes: Route[];
	routes_route_errors: RoutesRouteError[];
	routes_tags: RoutesTag[];
	routes_translations: RoutesTranslation[];
	scenario_categories: ScenarioCategory[];
	scenario_categories_translations: ScenarioCategoriesTranslation[];
	scenarios: Scenario[];
	scenarios_channels: ScenariosChannel[];
	scenarios_files: ScenariosFile[];
	scenarios_tags: ScenariosTag[];
	scenarios_translations: ScenariosTranslation[];
	steps: Step[];
	steps_translations: StepsTranslation[];
	tags: Tag[];
	tags_translations: TagsTranslation[];
	directus_activity: DirectusActivity[];
	directus_collections: DirectusCollection[];
	directus_comments: DirectusComment[];
	directus_fields: DirectusField[];
	directus_files: DirectusFile[];
	directus_folders: DirectusFolder[];
	directus_presets: DirectusPreset[];
	directus_relations: DirectusRelation[];
	directus_revisions: DirectusRevision[];
	directus_roles: DirectusRole[];
	directus_settings: DirectusSettings;
	directus_users: DirectusUser[];
	directus_dashboards: DirectusDashboard[];
	directus_panels: DirectusPanel[];
	directus_notifications: DirectusNotification[];
	directus_shares: DirectusShare[];
	directus_flows: DirectusFlow[];
	directus_translations: DirectusTranslation[];
	directus_versions: DirectusVersion[];
}

export enum CollectionNames {
	backend_errors = 'backend_errors',
	backend_properties = 'backend_properties',
	backend_routes = 'backend_routes',
	backend_routes_backend_errors = 'backend_routes_backend_errors',
	backend_routes_predefined_values = 'backend_routes_predefined_values',
	blocks_cards = 'blocks_cards',
	blocks_cards_translations = 'blocks_cards_translations',
	blocks_herobanners = 'blocks_herobanners',
	blocks_herobanners_buttons = 'blocks_herobanners_buttons',
	blocks_herobanners_items = 'blocks_herobanners_items',
	blocks_herobanners_tags = 'blocks_herobanners_tags',
	blocks_herobanners_translations = 'blocks_herobanners_translations',
	blocks_sections = 'blocks_sections',
	blocks_sections_buttons = 'blocks_sections_buttons',
	blocks_sections_items = 'blocks_sections_items',
	blocks_sections_translations = 'blocks_sections_translations',
	buttons = 'buttons',
	buttons_target = 'buttons_target',
	buttons_translations = 'buttons_translations',
	caps_configurations = 'caps_configurations',
	caps_provider_configurations = 'caps_provider_configurations',
	caps_providers = 'caps_providers',
	channels = 'channels',
	languages = 'languages',
	migration_notes = 'migration_notes',
	migration_notes_channels = 'migration_notes_channels',
	migration_notes_routes = 'migration_notes_routes',
	migration_notes_tags = 'migration_notes_tags',
	migration_notes_translations = 'migration_notes_translations',
	ota_product_ids = 'ota_product_ids',
	ota_rate_ids = 'ota_rate_ids',
	ota_room_ids = 'ota_room_ids',
	otas = 'otas',
	pages = 'pages',
	pages_blocks = 'pages_blocks',
	pages_tags = 'pages_tags',
	pages_translations = 'pages_translations',
	predefined_values = 'predefined_values',
	releases = 'releases',
	releases_channels = 'releases_channels',
	releases_migration_notes = 'releases_migration_notes',
	releases_routes = 'releases_routes',
	releases_tags = 'releases_tags',
	releases_translations = 'releases_translations',
	route_errors = 'route_errors',
	route_input_properties = 'route_input_properties',
	route_input_properties_backend_properties = 'route_input_properties_backend_properties',
	route_input_properties_route_input_properties = 'route_input_properties_route_input_properties',
	route_output_properties = 'route_output_properties',
	route_output_properties_backend_properties = 'route_output_properties_backend_properties',
	routes = 'routes',
	routes_route_errors = 'routes_route_errors',
	routes_tags = 'routes_tags',
	routes_translations = 'routes_translations',
	scenario_categories = 'scenario_categories',
	scenario_categories_translations = 'scenario_categories_translations',
	scenarios = 'scenarios',
	scenarios_channels = 'scenarios_channels',
	scenarios_files = 'scenarios_files',
	scenarios_tags = 'scenarios_tags',
	scenarios_translations = 'scenarios_translations',
	steps = 'steps',
	steps_translations = 'steps_translations',
	tags = 'tags',
	tags_translations = 'tags_translations',
	directus_activity = 'directus_activity',
	directus_collections = 'directus_collections',
	directus_comments = 'directus_comments',
	directus_fields = 'directus_fields',
	directus_files = 'directus_files',
	directus_folders = 'directus_folders',
	directus_presets = 'directus_presets',
	directus_relations = 'directus_relations',
	directus_revisions = 'directus_revisions',
	directus_roles = 'directus_roles',
	directus_settings = 'directus_settings',
	directus_users = 'directus_users',
	directus_dashboards = 'directus_dashboards',
	directus_panels = 'directus_panels',
	directus_notifications = 'directus_notifications',
	directus_shares = 'directus_shares',
	directus_flows = 'directus_flows',
	directus_translations = 'directus_translations',
	directus_versions = 'directus_versions'
}