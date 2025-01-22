--
-- predictify_ownerQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO predictify_owner;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    user_id integer,
    key character varying(255) NOT NULL,
    expires_at timestamp without time zone,
    usage_limit integer DEFAULT 1000,
    usage_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.api_keys OWNER TO predictify_owner;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_keys_id_seq OWNER TO predictify_owner;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(255),
    target_id integer,
    target_table character varying(255),
    old_value jsonb,
    new_value jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO predictify_owner;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO predictify_owner;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: charts; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.charts (
    id integer NOT NULL,
    key character varying NOT NULL,
    label character varying,
    description character varying,
    "column" character varying,
    dtype character varying,
    option character varying,
    "xAxis" text[],
    "yAxis" text[],
    config json,
    workspace_id integer,
    dataset_id integer,
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.charts OWNER TO predictify_owner;

--
-- Name: charts_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.charts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.charts_id_seq OWNER TO predictify_owner;

--
-- Name: charts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.charts_id_seq OWNED BY public.charts.id;


--
-- Name: datasets; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.datasets (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    data jsonb,
    data_metadata jsonb,
    workspace_id integer,
    file_path character varying(255),
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    CONSTRAINT datasets_file_path_check CHECK (((file_path)::text ~* '^(/[^/ ]*)+/?$'::text))
);


ALTER TABLE public.datasets OWNER TO predictify_owner;

--
-- Name: datasets_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.datasets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.datasets_id_seq OWNER TO predictify_owner;

--
-- Name: datasets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.datasets_id_seq OWNED BY public.datasets.id;


--
-- Name: models; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.models (
    id integer NOT NULL,
    processed_data_id integer,
    name character varying(255),
    version integer DEFAULT 1,
    model_file_path character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    CONSTRAINT models_model_file_path_check CHECK (((model_file_path)::text ~* '^(/[^/ ]*)+/?$'::text))
);


ALTER TABLE public.models OWNER TO predictify_owner;

--
-- Name: models_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.models_id_seq OWNER TO predictify_owner;

--
-- Name: models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.models_id_seq OWNED BY public.models.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    title character varying(255),
    tag character varying(50)
);


ALTER TABLE public.notifications OWNER TO predictify_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO predictify_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO predictify_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO predictify_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.plans (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    price numeric(10,2) DEFAULT 0.00,
    max_workspaces integer,
    max_datasets_per_workspace integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.plans OWNER TO predictify_owner;

--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plans_id_seq OWNER TO predictify_owner;

--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.plans.id;


--
-- Name: predictions; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.predictions (
    id integer NOT NULL,
    model_id integer,
    input_data jsonb,
    output_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.predictions OWNER TO predictify_owner;

--
-- Name: predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predictions_id_seq OWNER TO predictify_owner;

--
-- Name: predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.predictions_id_seq OWNED BY public.predictions.id;


--
-- Name: processed_data; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.processed_data (
    id integer NOT NULL,
    dataset_id integer,
    name character varying(255),
    version integer DEFAULT 1,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.processed_data OWNER TO predictify_owner;

--
-- Name: processed_data_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.processed_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.processed_data_id_seq OWNER TO predictify_owner;

--
-- Name: processed_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.processed_data_id_seq OWNED BY public.processed_data.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO predictify_owner;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO predictify_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO predictify_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.team_members (
    team_id integer,
    user_id integer,
    role_id integer,
    workspace_id integer,
    email character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    id integer NOT NULL
);


ALTER TABLE public.team_members OWNER TO predictify_owner;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO predictify_owner;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    workspace_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO predictify_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO predictify_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: ticket_responses; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.ticket_responses (
    id integer NOT NULL,
    ticket_id integer,
    responder_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.ticket_responses OWNER TO predictify_owner;

--
-- Name: ticket_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.ticket_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_responses_id_seq OWNER TO predictify_owner;

--
-- Name: ticket_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.ticket_responses_id_seq OWNED BY public.ticket_responses.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    user_id integer,
    subject character varying(255),
    description text,
    status character varying(50) DEFAULT 'Open'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.tickets OWNER TO predictify_owner;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO predictify_owner;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    user_id integer,
    plan_id integer,
    current_workspace_id integer,
    role character varying(50) DEFAULT 'Viewer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_profiles OWNER TO predictify_owner;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profiles_id_seq OWNER TO predictify_owner;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    workspace_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO predictify_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying,
    otp character varying(6),
    otp_expiry timestamp without time zone,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    google_id character varying(255),
    name character varying(255),
    verified_at timestamp without time zone,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    picture character varying(255)
);


ALTER TABLE public.users OWNER TO predictify_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO predictify_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: predictify_owner
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    team_id integer
);


ALTER TABLE public.workspaces OWNER TO predictify_owner;

--
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: predictify_owner
--

CREATE SEQUENCE public.workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspaces_id_seq OWNER TO predictify_owner;

--
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: predictify_owner
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: charts id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts ALTER COLUMN id SET DEFAULT nextval('public.charts_id_seq'::regclass);


--
-- Name: datasets id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.datasets ALTER COLUMN id SET DEFAULT nextval('public.datasets_id_seq'::regclass);


--
-- Name: models id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.models ALTER COLUMN id SET DEFAULT nextval('public.models_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: predictions id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.predictions ALTER COLUMN id SET DEFAULT nextval('public.predictions_id_seq'::regclass);


--
-- Name: processed_data id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.processed_data ALTER COLUMN id SET DEFAULT nextval('public.processed_data_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: ticket_responses id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.ticket_responses ALTER COLUMN id SET DEFAULT nextval('public.ticket_responses_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: api_keys api_keys_key_key; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key UNIQUE (key);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: charts charts_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_pkey PRIMARY KEY (id);


--
-- Name: datasets datasets_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_pkey PRIMARY KEY (id);


--
-- Name: team_members id; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT id PRIMARY KEY (id);


--
-- Name: models models_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: predictions predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_pkey PRIMARY KEY (id);


--
-- Name: processed_data processed_data_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.processed_data
    ADD CONSTRAINT processed_data_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: ticket_responses ticket_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, workspace_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_api_key_user; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_api_key_user ON public.api_keys USING btree (user_id);


--
-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_audit_log_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_dataset_workspace; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_dataset_workspace ON public.datasets USING btree (workspace_id);


--
-- Name: idx_model_processed_data; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_model_processed_data ON public.models USING btree (processed_data_id);


--
-- Name: idx_notification_user; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_notification_user ON public.notifications USING btree (user_id);


--
-- Name: idx_prediction_model; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_prediction_model ON public.predictions USING btree (model_id);


--
-- Name: idx_processed_data_dataset; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_processed_data_dataset ON public.processed_data USING btree (dataset_id);


--
-- Name: idx_team_workspace; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_team_workspace ON public.teams USING btree (workspace_id);


--
-- Name: idx_ticket_user; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_ticket_user ON public.tickets USING btree (user_id);


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_user_email ON public.users USING btree (email);


--
-- Name: idx_user_google_id; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_user_google_id ON public.users USING btree (google_id);


--
-- Name: idx_workspace_created_by; Type: INDEX; Schema: public; Owner: predictify_owner
--

CREATE INDEX idx_workspace_created_by ON public.workspaces USING btree (created_by);


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: charts charts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: charts charts_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON DELETE CASCADE;


--
-- Name: charts charts_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: charts charts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: datasets datasets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: datasets datasets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: datasets datasets_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: user_profiles fk_current_workspace; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_current_workspace FOREIGN KEY (current_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: user_profiles fk_plan; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: audit_logs fk_target_user; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_target_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_members fk_team_role; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_team_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: team_members fk_workspace; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: models models_processed_data_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_processed_data_id_fkey FOREIGN KEY (processed_data_id) REFERENCES public.processed_data(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: predictions predictions_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id) ON DELETE CASCADE;


--
-- Name: processed_data processed_data_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.processed_data
    ADD CONSTRAINT processed_data_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: teams teams_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: teams teams_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: ticket_responses ticket_responses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES public.users(id);


--
-- Name: ticket_responses ticket_responses_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_current_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_current_workspace_id_fkey FOREIGN KEY (current_workspace_id) REFERENCES public.workspaces(id);


--
-- Name: user_profiles user_profiles_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: predictify_owner
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- predictify_ownerQL database dump complete
--