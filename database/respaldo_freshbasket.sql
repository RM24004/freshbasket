--
-- PostgreSQL database dump
--

\restrict JwiYp9cNQH4LaQoTpwojzmU92a4rIGUjH8Lbe2zHjD11lGuLcZ5rlQPx3ryNCvA

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: process_audit_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_identifier TEXT;
    user_full_name TEXT;
    pk_column TEXT;
    primary_key_value INT;
BEGIN
    -- 1. Intentamos obtener el usuario desde la sesión de la app o el usuario de la BD
    BEGIN
        current_identifier := NULLIF(current_setting('app.current_user_id', true), '');
    EXCEPTION WHEN OTHERS THEN
        current_identifier := NULL;
    END;

    IF current_identifier IS NULL THEN
        current_identifier := SESSION_USER; -- El usuario con el que se conecta Java
    END IF;

    -- 2. Buscamos el Nombre y Apellido en la tabla 'users' usando el identificador (email)
    -- (Ajusta 'email' si la columna de tu tabla users se llama diferente, ej. 'correo')
    SELECT CONCAT(name, ' ', last_name) INTO user_full_name
    FROM users
    WHERE email = current_identifier
    LIMIT 1;

    -- 3. Si no se encontró un usuario con ese email, asignamos un nombre genérico
    IF user_full_name IS NULL OR user_full_name = ' ' THEN
        user_full_name := 'Sistema (' || current_identifier || ')';
    END IF;

    -- 4. Buscamos el nombre de la columna llave primaria de la tabla actual
    SELECT a.attname INTO pk_column
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = TG_RELID AND i.indisprimary
    LIMIT 1;

    -- 5. Insertar en la auditoría con el nombre completo obtenido
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        SELECT (to_jsonb(NEW) ->> pk_column)::INT INTO primary_key_value;
        
        INSERT INTO auditlogs (entity, entity_id, action, user_id, created_at)
        VALUES (TG_RELNAME, primary_key_value, TG_OP, user_full_name, CURRENT_TIMESTAMP);
        RETURN NEW;
        
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT (to_jsonb(OLD) ->> pk_column)::INT INTO primary_key_value;
        
        INSERT INTO auditlogs (entity, entity_id, action, user_id, created_at)
        VALUES (TG_RELNAME, primary_key_value, TG_OP, user_full_name, CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.process_audit_log() OWNER TO postgres;

--
-- Name: process_auditlogs(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_auditlogs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_user_val VARCHAR(255); -- Cambiado a VARCHAR para que coincida con tu tabla
BEGIN
    -- Intentar obtener el ID o nombre del usuario desde la sesión de la app
    BEGIN
        current_user_val := NULLIF(current_setting('app.current_user_id', true), '');
    EXCEPTION WHEN OTHERS THEN
        current_user_val := NULL;
    END;

    -- Si la variable está vacía o es NULL, le asignamos el valor por defecto
    IF current_user_val IS NULL THEN
        current_user_val := 'Sistema (postgres)';
    END IF;

    -- Registrar la auditoría
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (entity, entity_id, action, user_id, created_at)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, current_user_val, CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (entity, entity_id, action, user_id, created_at)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, current_user_val, CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.process_auditlogs() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditlogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditlogs (
    audit_id bigint NOT NULL,
    entity character varying(25) NOT NULL,
    entity_id bigint NOT NULL,
    user_id character varying(255),
    action character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auditlogs OWNER TO postgres;

--
-- Name: auditlogs_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditlogs_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditlogs_audit_id_seq OWNER TO postgres;

--
-- Name: auditlogs_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditlogs_audit_id_seq OWNED BY public.auditlogs.audit_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id bigint NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    active boolean DEFAULT true
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.category_id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    country_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(100),
    active boolean DEFAULT true
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.country_id;


--
-- Name: entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entries (
    entry_id bigint NOT NULL,
    entry_date timestamp(6) without time zone NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(38,2) NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL,
    supplier_id bigint NOT NULL,
    active boolean DEFAULT true
);


ALTER TABLE public.entries OWNER TO postgres;

--
-- Name: entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entries_id_seq OWNER TO postgres;

--
-- Name: entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entries_id_seq OWNED BY public.entries.entry_id;


--
-- Name: exits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exits (
    exit_id bigint NOT NULL,
    exit_date timestamp(6) without time zone NOT NULL,
    quantity integer NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL,
    active boolean DEFAULT true
);


ALTER TABLE public.exits OWNER TO postgres;

--
-- Name: exits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exits_id_seq OWNER TO postgres;

--
-- Name: exits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exits_id_seq OWNED BY public.exits.exit_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(38,2) NOT NULL,
    current_stock integer NOT NULL,
    image_url character varying(500),
    description character varying(500),
    category_id bigint NOT NULL,
    supplier_id bigint NOT NULL,
    user_id bigint,
    active boolean DEFAULT true
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.product_id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    supplier_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15),
    email character varying(100) NOT NULL,
    address character varying(150),
    country_id bigint,
    active boolean DEFAULT true
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.supplier_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    country_id bigint,
    role character varying(255) DEFAULT 'USUARIO'::character varying,
    active boolean DEFAULT true,
    CONSTRAINT chk_rol CHECK (((role)::text = ANY ((ARRAY['CLIENTE'::character varying, 'ADMINISTRADOR'::character varying, 'SOPORTE'::character varying, 'EMPLEADO'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.user_id;


--
-- Name: auditlogs audit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs ALTER COLUMN audit_id SET DEFAULT nextval('public.auditlogs_audit_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Name: entries entry_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries ALTER COLUMN entry_id SET DEFAULT nextval('public.entries_id_seq'::regclass);


--
-- Name: exits exit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits ALTER COLUMN exit_id SET DEFAULT nextval('public.exits_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: suppliers supplier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN supplier_id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: auditlogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditlogs (audit_id, entity, entity_id, user_id, action, created_at) FROM stdin;
2	PRODUCT	5	9	DELETE	2026-05-01 13:33:09.08322
3	PRODUCT	9	1	UPDATE	2026-05-01 14:36:49.263535
4	USERS	1	1	UPDATE	2026-05-01 15:07:23.487925
9	USERS	3	3	UPDATE	2026-05-04 16:28:48.943696
10	USERS	11	11	UPDATE	2026-05-12 17:40:59.723194
11	USERS	11	11	UPDATE	2026-05-13 11:53:05.222268
12	USERS	11	11	UPDATE	2026-05-13 13:31:59.153857
15	suppliers	16	Sistema (postgres)	INSERT	2026-05-26 14:58:38.798251
16	users	14	Sistema (postgres)	UPDATE	2026-05-26 15:04:47.90036
17	suppliers	11	Sistema (postgres)	DELETE	2026-05-26 15:09:48.941685
18	products	9	Sistema (postgres)	UPDATE	2026-05-26 15:38:10.27402
19	products	16	Sistema (postgres)	INSERT	2026-05-26 15:51:54.415053
20	entries	15	Sistema (postgres)	INSERT	2026-05-26 15:51:54.415053
21	users	23	Sistema (postgres)	UPDATE	2026-05-26 16:44:28.833526
22	suppliers	17	Sistema (postgres)	INSERT	2026-05-26 16:50:15.834362
23	products	17	Sistema (postgres)	INSERT	2026-05-26 16:53:56.074232
24	entries	16	Sistema (postgres)	INSERT	2026-05-26 16:53:56.074232
25	categories	10	Sistema (postgres)	INSERT	2026-05-26 17:40:40.088802
26	countries	2	Sistema (postgres)	UPDATE	2026-05-26 17:43:03.12054
27	entries	17	Sistema (postgres)	INSERT	2026-05-27 16:24:01.330443
28	products	3	Sistema (postgres)	UPDATE	2026-05-27 16:24:01.330443
29	entries	17	Sistema (postgres)	UPDATE	2026-05-27 16:25:59.427358
30	products	3	Sistema (postgres)	UPDATE	2026-05-27 16:25:59.427358
31	entries	17	Sistema (postgres)	UPDATE	2026-05-27 16:41:16.746778
32	products	3	Sistema (postgres)	UPDATE	2026-05-27 16:41:16.746778
33	products	2	Sistema (postgres)	UPDATE	2026-05-28 15:38:42.875652
34	products	18	Sistema (postgres)	INSERT	2026-05-28 15:44:21.818446
35	entries	18	Sistema (postgres)	INSERT	2026-05-28 15:44:21.818446
36	products	19	Sistema (postgres)	INSERT	2026-05-28 15:44:28.844291
37	entries	19	Sistema (postgres)	INSERT	2026-05-28 15:44:28.844291
38	products	20	Sistema (postgres)	INSERT	2026-05-28 15:50:00.06033
39	entries	20	Sistema (postgres)	INSERT	2026-05-28 15:50:00.06033
40	products	20	Sistema (postgres)	UPDATE	2026-05-28 15:53:25.563196
41	products	21	Sistema (postgres)	INSERT	2026-05-28 15:58:48.881244
42	entries	21	Sistema (postgres)	INSERT	2026-05-28 15:58:48.881244
43	suppliers	18	Sistema (postgres)	INSERT	2026-05-28 16:44:18.402207
44	suppliers	16	Sistema (postgres)	UPDATE	2026-05-28 16:49:29.808276
45	products	19	Sistema (postgres)	UPDATE	2026-05-28 16:54:01.683031
46	products	19	Sistema (postgres)	UPDATE	2026-05-28 16:58:23.291024
47	users	1	Sistema (postgres)	UPDATE	2026-05-28 17:04:21.64352
48	users	24	Sistema (postgres)	UPDATE	2026-05-28 17:05:05.460266
49	users	32	Sistema (postgres)	INSERT	2026-05-28 17:07:13.407648
50	entries	22	Sistema (postgres)	INSERT	2026-05-28 17:16:51.509464
51	products	13	Sistema (postgres)	UPDATE	2026-05-28 17:16:51.509464
52	entries	19	Sistema (postgres)	UPDATE	2026-05-28 17:18:30.199431
53	products	19	Sistema (postgres)	UPDATE	2026-05-28 17:18:30.199431
54	countries	17	Sistema (postgres)	INSERT	2026-05-28 18:10:32.783643
55	users	33	Sistema (postgres)	INSERT	2026-05-28 18:10:33.099969
56	users	34	Sistema (postgres)	INSERT	2026-06-01 16:32:18.876949
57	countries	18	Sistema (postgres)	INSERT	2026-06-01 17:03:15.776448
58	users	35	Sistema (postgres)	INSERT	2026-06-01 17:03:16.284725
59	suppliers	19	Sistema (postgres)	INSERT	2026-06-02 07:50:16.859296
60	suppliers	19	Sistema (postgres)	UPDATE	2026-06-02 07:51:25.187087
61	suppliers	19	Sistema (postgres)	UPDATE	2026-06-02 07:51:45.837185
62	entries	1	Sistema (postgres)	UPDATE	2026-06-02 09:16:17.763047
63	entries	5	Sistema (postgres)	UPDATE	2026-06-02 09:17:06.678107
64	products	6	Sistema (postgres)	UPDATE	2026-06-02 09:17:06.678107
65	suppliers	20	Sistema (postgres)	INSERT	2026-06-02 09:19:18.790847
66	products	22	Sistema (postgres)	INSERT	2026-06-02 09:48:31.285304
67	entries	23	Sistema (postgres)	INSERT	2026-06-02 09:48:31.285304
68	products	22	Sistema (postgres)	UPDATE	2026-06-02 09:52:27.146926
69	entries	23	Sistema (postgres)	UPDATE	2026-06-02 10:01:08.719858
70	products	22	Sistema (postgres)	UPDATE	2026-06-02 10:01:08.719858
71	products	22	Sistema (postgres)	UPDATE	2026-06-02 12:06:38.195842
72	entries	24	Sistema (postgres)	INSERT	2026-06-02 10:08:03.805738
73	products	22	Sistema (postgres)	UPDATE	2026-06-02 10:08:03.805738
74	products	22	Sistema (postgres)	UPDATE	2026-06-02 10:47:21.041122
75	entries	19	Sistema (postgres)	UPDATE	2026-06-02 13:32:56.872444
76	entries	17	Sistema (postgres)	UPDATE	2026-06-02 13:46:49.038986
77	users	4	Sistema (postgres)	UPDATE	2026-06-02 12:24:04.551761
78	countries	19	Sistema (postgres)	INSERT	2026-06-02 12:28:02.942141
79	users	36	Sistema (postgres)	INSERT	2026-06-02 12:28:02.942141
80	users	36	Sistema (postgres)	UPDATE	2026-06-02 12:34:55.180963
81	users	36	Sistema (postgres)	UPDATE	2026-06-02 14:35:40.507225
82	exits	5	Sistema (postgres)	INSERT	2026-06-02 20:15:39.041314
83	products	3	Sistema (postgres)	UPDATE	2026-06-02 20:15:39.041314
84	exits	5	Sistema (postgres)	UPDATE	2026-06-02 20:19:34.168216
85	products	3	Sistema (postgres)	UPDATE	2026-06-02 20:19:34.168216
86	entries	17	Sistema (postgres)	UPDATE	2026-06-03 16:45:52.229492
87	products	3	Sistema (postgres)	UPDATE	2026-06-03 16:45:52.229492
88	exits	3	Sistema (postgres)	UPDATE	2026-06-03 16:46:59.061244
89	products	3	Sistema (postgres)	UPDATE	2026-06-03 16:46:59.061244
90	entries	25	Sistema (postgres)	INSERT	2026-06-03 17:08:29.598524
91	products	13	Sistema (postgres)	UPDATE	2026-06-03 17:08:29.598524
92	exits	6	Sistema (postgres)	INSERT	2026-06-03 17:20:39.541842
93	products	13	Sistema (postgres)	UPDATE	2026-06-03 17:20:39.541842
94	exits	6	Sistema (postgres)	UPDATE	2026-06-03 17:21:42.665211
95	products	13	Sistema (postgres)	UPDATE	2026-06-03 17:21:42.665211
96	users	20	Sistema (postgres)	UPDATE	2026-06-04 09:00:49.962133
97	users	27	Sistema (postgres)	UPDATE	2026-06-04 09:38:11.709118
98	users	9	Sistema (postgres)	UPDATE	2026-06-04 11:01:42.672529
99	users	20	Sistema (postgres)	UPDATE	2026-06-04 11:03:01.964198
100	users	11	Sistema (postgres)	UPDATE	2026-06-04 11:06:23.332122
101	users	37	Sistema (postgres)	INSERT	2026-06-04 11:07:49.152916
102	users	1	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
103	users	3	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
104	users	4	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
105	users	13	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
106	users	14	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
107	users	18	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
108	users	21	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
109	users	22	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
110	users	23	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
111	users	24	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
112	users	27	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
113	users	30	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
114	users	32	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
115	users	33	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
116	users	34	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
117	users	35	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
118	users	37	Sistema (postgres)	UPDATE	2026-06-04 13:22:14.591744
119	countries	20	Sistema (postgres)	INSERT	2026-06-05 08:48:10.29124
120	users	11	Sistema (postgres)	UPDATE	2026-06-05 09:08:47.562843
121	users	30	Sistema (postgres)	UPDATE	2026-06-05 09:09:47.666672
122	users	44	Sistema (postgres)	INSERT	2026-06-05 09:13:30.628376
123	categories	11	Sistema (postgres)	INSERT	2026-06-05 11:02:24.430798
124	categories	11	Sistema (postgres)	UPDATE	2026-06-05 11:03:05.462016
125	categories	11	Sistema (postgres)	UPDATE	2026-06-05 11:07:09.19384
126	countries	19	Sistema (postgres)	UPDATE	2026-06-05 14:43:20.059117
127	countries	19	Sistema (postgres)	UPDATE	2026-06-05 14:43:42.111516
128	countries	21	Sistema (postgres)	INSERT	2026-06-05 14:44:49.466373
129	categories	11	Sistema (postgres)	UPDATE	2026-06-05 16:48:42.924626
130	countries	22	Sistema (postgres)	INSERT	2026-06-05 15:36:56.323285
131	suppliers	21	Sistema (postgres)	INSERT	2026-06-05 15:36:58.888314
132	suppliers	1	Sistema (postgres)	UPDATE	2026-06-05 15:38:51.384158
133	users	31	Sistema (postgres)	UPDATE	2026-06-05 15:49:30.101292
134	users	45	Sistema (postgres)	INSERT	2026-06-05 15:51:07.51336
135	users	32	Sistema (postgres)	UPDATE	2026-06-05 15:51:44.526559
136	countries	10	Sistema (postgres)	UPDATE	2026-06-05 15:53:03.128191
137	products	1	Sistema (postgres)	UPDATE	2026-06-05 16:22:45.139611
138	products	23	Sistema (postgres)	INSERT	2026-06-05 16:23:46.482708
139	entries	26	Sistema (postgres)	INSERT	2026-06-05 16:23:46.482708
140	products	12	Sistema (postgres)	UPDATE	2026-06-05 16:30:22.829273
141	entries	27	Sistema (postgres)	INSERT	2026-06-05 16:31:34.739688
142	products	23	Sistema (postgres)	UPDATE	2026-06-05 16:31:34.739688
143	entries	27	Sistema (postgres)	UPDATE	2026-06-05 16:32:25.114549
144	products	23	Sistema (postgres)	UPDATE	2026-06-05 16:32:25.114549
145	entries	27	Sistema (postgres)	UPDATE	2026-06-05 16:33:28.122094
146	products	23	Sistema (postgres)	UPDATE	2026-06-05 16:33:28.122094
147	exits	7	Sistema (postgres)	INSERT	2026-06-05 16:34:17.836308
148	products	20	Sistema (postgres)	UPDATE	2026-06-05 16:34:17.836308
149	exits	7	Sistema (postgres)	UPDATE	2026-06-05 16:34:49.00538
150	products	20	Sistema (postgres)	UPDATE	2026-06-05 16:34:49.00538
151	exits	7	Sistema (postgres)	UPDATE	2026-06-05 16:35:16.543552
152	products	20	Sistema (postgres)	UPDATE	2026-06-05 16:35:16.543552
153	products	24	Sistema (postgres)	INSERT	2026-06-05 16:39:31.334135
154	entries	28	Sistema (postgres)	INSERT	2026-06-05 16:39:31.334135
155	categories	11	Sistema (postgres)	UPDATE	2026-06-05 16:40:52.456194
156	categories	12	Sistema (postgres)	INSERT	2026-06-05 16:50:04.912453
157	suppliers	22	Sistema (postgres)	INSERT	2026-06-05 16:51:33.267314
158	products	25	Sistema (postgres)	INSERT	2026-06-05 16:53:35.18779
159	entries	29	Sistema (postgres)	INSERT	2026-06-05 16:53:35.18779
160	entries	30	Sistema (postgres)	INSERT	2026-06-05 16:55:38.317437
161	products	25	Sistema (postgres)	UPDATE	2026-06-05 16:55:38.317437
162	products	26	Sistema (postgres)	INSERT	2026-06-05 17:19:06.594566
163	entries	31	Sistema (postgres)	INSERT	2026-06-05 17:19:06.594566
164	products	23	Sistema (postgres)	UPDATE	2026-06-05 17:20:10.409048
165	entries	32	Sistema (postgres)	INSERT	2026-06-05 17:22:12.927252
166	products	26	Sistema (postgres)	UPDATE	2026-06-05 17:22:12.927252
167	exits	8	Sistema (postgres)	INSERT	2026-06-05 17:23:13.040631
168	products	26	Sistema (postgres)	UPDATE	2026-06-05 17:23:13.040631
169	suppliers	23	Sistema (postgres)	INSERT	2026-06-05 17:25:10.102075
170	suppliers	23	Sistema (postgres)	UPDATE	2026-06-05 17:25:49.226321
171	products	1	Sistema (postgres)	UPDATE	2026-06-05 17:34:33.358121
172	categories	13	Sistema (postgres)	INSERT	2026-06-06 04:56:11.061729
173	users	46	Sistema (postgres)	INSERT	2026-06-06 13:05:33.028064
174	products	9	Sistema (postgres)	UPDATE	2026-06-06 09:09:46.919802
175	products	12	Sistema (postgres)	UPDATE	2026-06-06 09:09:46.919802
176	products	22	Sistema (postgres)	UPDATE	2026-06-06 09:09:46.919802
177	products	23	Sistema (postgres)	UPDATE	2026-06-06 09:09:46.919802
178	products	19	Sistema (postgres)	UPDATE	2026-06-06 09:10:48.297127
179	users	23	Sistema (postgres)	UPDATE	2026-06-06 09:11:31.268646
180	users	24	Sistema (postgres)	UPDATE	2026-06-06 09:11:31.268646
181	users	32	Sistema (postgres)	UPDATE	2026-06-06 09:11:31.268646
182	suppliers	16	Sistema (postgres)	UPDATE	2026-06-06 09:14:24.877425
183	suppliers	19	Sistema (postgres)	UPDATE	2026-06-06 09:14:24.877425
184	exits	5	Sistema (postgres)	UPDATE	2026-06-06 09:15:16.950292
185	exits	7	Sistema (postgres)	UPDATE	2026-06-06 09:15:16.950292
186	entries	27	Sistema (postgres)	UPDATE	2026-06-06 09:16:15.416513
187	countries	3	Sistema (postgres)	UPDATE	2026-06-06 13:18:11.759766
188	countries	3	Sistema (postgres)	UPDATE	2026-06-06 09:18:55.682911
189	categories	14	Sistema (postgres)	INSERT	2026-06-06 13:37:13.533688
190	entries	2	Sistema (postgres)	UPDATE	2026-06-06 13:39:02.483875
191	products	3	Sistema (postgres)	UPDATE	2026-06-06 13:39:02.483875
192	users	11	Sistema (postgres)	UPDATE	2026-06-06 15:36:33.083606
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, name, description, active) FROM stdin;
3	Verduras	Verduras nacionales	t
6	Carnes	categoria de carnes nacionales e importadas	t
7	Harinas	Harinas en general(arroz, trigo, maiz)	t
8	Bebidas	Bebidas en general, nacionales e importadas	t
1	Frutas	Frutas nacionales o importadas	t
2	Leches	Todo tipo de leches, liquidas y en polvo	t
9	Galletas	Galletas en general	t
10	Cereales	categoria de Cereales nacionales e importados	t
11	Papel 	Papel de baño o para cocina importado y nacional	t
12	Pastas	Pastas importadas o nacionales	t
13	Granos basicos	Todo lo relacionado, con frijoles, arroz, maíz, maicillo, entre otros.	t
14	Pan	Pan en general, importado o nacional	t
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (country_id, name, description, active) FROM stdin;
4	Colombia	Pais grande, ubicado en America del Sur, provee diferentes productos	t
5	Argentina	Pais grande, ubicado en America del Sur, provee diferentes productos carnicos	t
1	Estados Unidos	País grande, provee diferentes productos entre ellos harina	t
7	Brasil	País grande de America del Sur, provee principalmente coco	t
8	Guatemala	País pequeño ubicado en América Central, provee frutas y verduras	t
9	Italia	IT	t
11	Alemania	AL	t
12	Japón	JA	t
13	Honduras	HO	t
14	Costa Rica	CO	t
15	Mexico	País grande, proveedor de productos en general	t
2	Australia	País grande, provee diferentes productos entre ellos carnes y leches	t
17	Inglaterra	País registrado automáticamente: Inglaterra	t
18	Egipto	País registrado automáticamente: Egipto	t
20	Nicaragua	País registrado automáticamente: Nicaragua	t
19	Rusia	País grande, abastece varios productos, entre ellos lácteos y harinas	t
21	Uruguay	País de America del Sur, abastece principalmente bebidas.	t
22	España	Pais creado automaticamente desde el modulo de proveedores	t
10	Francia	País de Europa, abastece de productos elaborados de harina	t
3	El Salvador	País pequeño ubicado en América Central, provee diferentes productos	t
\.


--
-- Data for Name: entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entries (entry_id, entry_date, quantity, unit_cost, product_id, user_id, supplier_id, active) FROM stdin;
4	2026-04-30 14:51:54.965562	100	3.60	3	1	1	t
6	2026-04-30 16:21:16.227017	10	3.20	8	9	8	t
7	2026-04-30 16:23:58.893573	40	3.20	8	4	8	t
8	2026-05-01 14:30:27.582984	25	2.40	9	1	8	t
9	2026-05-01 14:32:55.099792	25	2.45	9	4	8	t
10	2026-05-07 17:07:12.677081	50	2.50	9	1	8	t
11	2026-05-19 16:19:30.56066	100	2.50	12	3	7	t
12	2026-05-20 16:00:27.667852	50	3.25	13	13	10	t
13	2026-05-20 16:25:59.948108	50	2.25	14	13	3	t
14	2026-05-20 17:29:32.220719	45	10.50	15	20	4	t
15	2026-05-26 15:51:54.617173	40	6.85	16	11	4	t
16	2026-05-26 16:53:56.168354	35	1.00	17	11	17	t
18	2026-05-28 15:44:21.893062	25	2.85	18	11	16	t
20	2026-05-28 15:50:00.094893	35	11.45	20	18	4	t
21	2026-05-28 15:58:48.909744	30	1.35	21	30	3	t
22	2026-05-28 17:16:51.51291	30	3.25	13	11	10	t
1	2026-04-25 12:17:00	100	0.50	1	1	2	t
5	2026-04-30 15:18:07.349179	80	1.25	6	4	3	t
23	2026-06-02 09:48:31.712934	55	1.65	22	11	3	t
24	2026-06-02 10:08:03.851577	25	1.65	22	27	3	t
19	2026-05-28 15:44:28.872426	25	2.85	19	11	16	t
17	2026-05-27 16:24:01.410487	25	2.55	3	11	1	t
25	2026-06-03 17:08:29.798521	20	3.25	13	11	10	t
26	2026-06-05 16:23:46.688001	35	4.50	23	11	21	t
28	2026-06-05 16:39:31.374661	25	3.10	24	9	21	t
29	2026-06-05 16:53:35.298489	45	1.10	25	20	22	t
30	2026-06-05 16:55:38.321295	25	1.15	25	20	22	t
31	2026-06-05 17:19:06.921459	15	3.75	26	11	18	t
32	2026-06-05 17:22:12.953251	15	3.75	26	11	18	t
27	2026-06-05 16:31:34.806594	20	4.50	23	11	21	t
2	2026-04-30 14:15:37.642247	45	2.55	3	11	1	t
\.


--
-- Data for Name: exits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exits (exit_id, exit_date, quantity, product_id, user_id, active) FROM stdin;
4	2026-05-07 17:05:06.833084	50	3	4	t
2	2026-04-30 16:53:35.976754	20	8	1	t
3	2026-05-07 16:30:33.261193	25	3	11	t
6	2026-06-03 17:20:39.558026	20	13	11	t
8	2026-06-05 17:23:13.05294	10	26	11	t
5	2026-06-02 20:15:39.12912	35	3	13	t
7	2026-06-05 16:34:17.880403	5	20	11	t
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (product_id, name, price, current_stock, image_url, description, category_id, supplier_id, user_id, active) FROM stdin;
22	Lechuga Fresh Green	1.65	80	https://tse1.mm.bing.net/th/id/OIP.ViuwTjeGQcNf08UgY3KDagAAAA?r=0&w=320&h=320&rs=1&pid=ImgDetMain&o=7&rm=3	Lechuga fresca nacional precio por unidad	3	3	11	t
6	Mango Zazón	1.25	100	https://tse1.explicit.bing.net/th/id/OIP.yyegoUwFvJsi_MzcQmDxsAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Mango verde nacional	1	3	18	t
20	Carne de Res Americana	11.45	25	https://tse2.mm.bing.net/th/id/OIP.QwriN6M2F8ZfGe6XvnB0fgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Libra de carne de res americano, Reeb eye	6	4	18	t
14	Naranja Orange One	2.25	50	https://tse4.mm.bing.net/th/id/OIP.45JAxq9dPUnHcvZ7HRzI-AHaEA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Naranja en presentacion de 1kg	1	3	13	t
15	Carne de Cerdo ahumado	10.50	45	https://tse3.mm.bing.net/th/id/OIP.10HOqjauptCpa0PvEaNyaAHaET?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Lomo de cerdo en presentación de 1kg	6	4	20	t
24	Papel toalla	3.10	25	https://th.bing.com/th/id/R.09b51dddf3d9881e4e518464f8b1054e?rik=Fy9GSJwiRHHXxw&pid=ImgRaw&r=0	En presentación de 6 rollos	11	21	9	t
16	Pollo Indio	6.85	40	https://tse2.mm.bing.net/th/id/OIP.RmvqQEUlhn_b9z6UpatbIwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Pollo Indio fresco en presentación entero	6	4	11	t
17	Coca Cola Original	1.00	35	https://tse1.mm.bing.net/th/id/OIP.O50AMYWjVR80Ua8LP2macgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Gaseosa Coca Cola original, presentación en lata 354 ml	8	17	11	t
13	Galleta OREO	3.25	80	https://th.bing.com/th/id/R.83e51105157978b422492a7505ea3b0b?rik=sr0aCtA0v7TLtw&riu=http%3a%2f%2fweb.superboom.net%2fweb%2fimage%2fproduct.template%2f38639%2fimage_1024%3funique%3dce4827a&ehk=%2fWA44uiXyLEOQzE%2bcaCtaRXY7j6nJmLCo20ShL25KEo%3d&risl=&pid=ImgRaw&r=0	Galleta de chocolate en paquetes de 12 unidades	9	10	13	t
23	Papel higienico	4.50	35	https://tse4.mm.bing.net/th/id/OIP.DHipxUH3W7eOBlxXNk8SugHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	En presentación de 12 rollos extra suave	11	21	11	t
8	Harina de maiz	3.20	30	https://walmarthn.vtexassets.com/arquivos/ids/187380/Harina-De-Maiz-Maseca-Bolsa-454-Gr-1-10138.jpg?v=637708274553530000\t	Harina de maiz en presentacion de 2 libras	7	8	9	t
25	Salsa Ranchera	1.15	70	https://walmartgt.vtexassets.com/arquivos/ids/774170/32863_01.jpg?v=638768031123630000	Salsa ranchera 180g, producto nacional	12	22	20	t
2	Pera Onn	0.75	55	https://grupodispersa.com.gt/wp-content/uploads/2016/01/1-pera-Anjou-verde.jpg	Pera importada clase A (precio por unidad)	1	3	31	t
18	Cereal Zucaritas	2.85	25	https://tse2.mm.bing.net/th/id/OIP.fDqw25mnlyS6GL1J58DxggHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	cereal en presentación de 620 g	10	16	11	t
19	Cereal Zucaritas Clasico	3.85	0	https://tse3.mm.bing.net/th/id/OIP.5mcVa3kaGxjfCnMfJncXFgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	cereal en presentación de 620 g clasico	10	16	11	t
3	Leche en polvo Australian 1Kg	2.55	190	https://cdn.phototourl.com/free/2026-05-19-30e9bd36-0465-4c2d-b73f-6ee0e12615e4.jpg	Leche importada desde Australia	2	1	4	t
21	Fresa One piece	1.35	30	https://ecommerce.surtifamiliar.com/backend/admin/backend/web/archivosDelCliente/items/images/Frutas-Frutas-empacadas-FRESA-BANDEJA-313820201112180102.jpg	Bandeja de fresas en presentación de una libra	1	3	30	t
26	Cereal Zucaritas Especial	3.75	20	https://tse4.mm.bing.net/th/id/OIP.X0eHYhdFLoH20t7ePy16qQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Cereal zucaritas presentación de 500g	10	18	11	t
1	Manzana Roja	0.60	150	https://tse1.mm.bing.net/th/id/OIP.LAlScQZ3K4VPUUJ35dVUgQHaFl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Manzana importada desde Estados Unidos	1	2	11	t
9	Harina de trigo	2.50	85	https://convy.mx/cdn/shop/products/70501659.jpg?v=1636474778	Harina de trigo en presentacion de 1 libra	7	8	1	t
12	Harina de Arroz	1.25	105	https://cdn.phototourl.com/free/2026-05-19-27d85ba2-7221-4e64-b2f0-32661965a0d4.jpg	Harina de arroz en presentación de una libra 	7	9	3	t
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (supplier_id, name, last_name, phone, email, address, country_id, active) FROM stdin;
4	Rancho 17	SA de CV	2340-2340	rancho17@mail.com	calle al tamarindo, Mendoza	5	t
2	Distribuidora del Campo	SA de CV	+1 479-421-8900	distribuidora.delcampo@mail.com	City of Arkansas	1	t
7	Yes	 El Salvador	2345-0080	yes.elsalvador@mail.com	Carretera a Sonsonate, km 23 1/2, Zona industrial	3	t
8	MASECA	SA de CV	2545-8976	maseca.harinas@mail.com	Zona Franca #1, carretera Comalapa, Olocuilta	3	t
9	Doña Blanca	El Salvador	+503 2543-1234	harinas.doñablanca@mail.com	Parque Industrial, km 13 carretera a Santa Tecla, La Libertad	3	t
10	Galletas OREO	SA de CV	+52 456789 234	galletasoreo@mail.com	Ciudad de Mexico, Mexico	15	t
3	Del Monte	Frutas y verduras	+503 2348-7645	delmonte.salvadorena@mail.com	carretera a Rio Chiquito, Chalatenango	3	t
17	The Coca Cola 	Company Ltd	+1 345 234 1234	thecocacola@mail.com	1001 East Boulevar, Los Angeles, California	1	t
18	Kelloggs	Company Ltd	+55 2345 1234	kelloggscereales@mail.com	Av. La Revolución, Ciudad de Mexico	15	t
20	Selecta	Global Productos	+55 45768798	selectaproductos@mail.com	Av. Los Girasoles #1500, Ciudad de Nuevo Leon	15	t
21	Scott	Company Ltd.	+56 4567 3456	scottcompanyglobal@mail.com	Av. Los Girasoles 1234 Madrid	22	t
1	Australian	Leches SA de CV	+61 452490-6789	leches.australian@mail.com	195 Marine Paradise, Camberra	2	t
22	Salsas Naturas	SA de CV	+503 2500-5467	naturas@mail.com	Av. Los Sisimiles #229, San Salvador	3	t
23	Cervecería	El Salvador	+503 2340-4567	cerveceriaelsalvador@mail.com	Calle a Santa Tecla, La Libertad	3	t
16	Selecta	Alimentos	+24 2345 8987	selectaAlimentos@mail.com	Av. Benito Juarez 1586, Ciudad Juarez	15	t
19	La Granja	Hermanos Ltd.	+503 2543-6787	lagranjahermanos@mail.com	Canton Matazano, calle al Jicaro, Quezaltepeque	3	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, last_name, email, phone, password, country_id, role, active) FROM stdin;
30	Anibal de la Fuente	Gaitán	anibalgaitan@mail.com	+55 2345674567	$2a$10$gF3YaOUSOXfCdYCvCFWzjeZNGqNCAWnXQTrULqyZYSbK8kD6Wkx5m	15	CLIENTE	t
44	Alirio	Menjivar	alirioperafancho@mail.com	+505 2345-2312	$2a$10$6QjSZ.haq/BVwDvMJi/Ny.oHopYbQ5RWOOxlxxXiS.5ZkS46Gm5F2	20	CLIENTE	t
27	Hiziro Hatuke	Wataro	hiziro.wataro@mail.com	+234 456789	$2a$10$6i3KLNsjr/PDQakegBTaFON4tNhD9L7eGdPAwiIG.qCwxiiQnvpbO	12	CLIENTE	t
31	Josep Albert	MackNail	josepalbert@mail.com	+33 78653-13243	$2a$10$kYiHyHGWYKI9RkiMJAwQC.vS1ViAEbPwJoMHyYUjC2PIQgGux9Btm	10	ADMINISTRADOR	t
45	Aquile Alexander	Bonaventura	aquilealexander@mail.com	+39 3456124567	$2a$10$bnRX6CtEr5jSvt3o3eyg2OkN/HdtTuag0b44uhogMI7SjJmxS6Bhm	9	SOPORTE	t
36	Alexander 	Milinkovic	alexandermilinkovic@mail.com	+902 57483746 232	$2a$10$SOx6WVpB0uhCPRosXTIazuZvTzpXSydbZ8ranLzb9kKykGKKxu2Ti	19	SOPORTE	t
46	Emmanuel	Cartagena	emmanuelcarta@mail.com	+57 1267-7689	$2a$10$qIFMulTxN.Q1jMO4hboenuI91SC/yV4qROnoTJEmQQllyGvbHLEia	4	CLIENTE	t
9	James Alonso	Smith López	smith.james@mail.com	+1 348 345 2345	$2a$10$7i8s6X570FZBnx/m1eFa2uvyt3ipzUJd5lNHKcX1p3YHMMMmOawam	1	SOPORTE	t
20	Martin Einsten	Jaramillo	martin.einsten@mail.com	+ 29 234 2334-1278	$2a$10$w0TaFZQya0M.nCWT2kIJ8.zhoXpJKFO7VeMEkMYx0oi9VqEpkoQ8e	5	EMPLEADO	t
1	Martin Antonio	Hernandez Verdugo	elbaby.lindo@mail.com	+504 7734-3421	$2a$10$acXndRoi3rMhEWjf8upfzej8ngYZGJrERr9lThqzG5ONucuNjK9lC	14	CLIENTE	t
3	Atilio del Carmen	Serrano Hidalgo	atilio.serrano@mail.com	+503 8000-9000	$2a$10$b.7LjFDT1EadyG8kVTGLweibTFjraLMx4wMazl6ai/YxHeGpcGP7W	3	CLIENTE	t
4	Juan Antonio	de la Vega Alemán	delavega.juan@mail.com	7745-8027	$2a$10$442cVXACCenHqi2Q177rZeBq3vN.9IDjwMFeK9oNP8h/s5DbpUqWe	4	CLIENTE	t
13	Juan	Martinez	juan.martinez@mail.com	7743-2021	$2a$10$BlaCV9KuDmhK7pk3uSMmVu7tVY6tH9/AC4CN7EyHN/rSsZsSW/hFG	3	CLIENTE	t
14	María	Aristoteles de Regalado	maria.aristoteles@mail.com	2589-6578	$2a$10$B6srV6Iogl2V/o2mWUFvMeKTTndBuaEJ92aADE9D6og0PHJR0Zepi	1	CLIENTE	t
18	Evelyn del Carmen	Melendez	evelyn.melendez@mail.com	2543-9087	$2a$10$OmLXG9owVuBK71bAFvB9jutPFbrBi1t30yOw6Gxi2CmCECSwbJOza	4	CLIENTE	t
21	Handerson Henry	Sommerville	handerson.somer@mail.com	+23 456 87695	$2a$10$SdZblcMd.wFvxUmvcqMSr.xzsVHBMNpwVGyS4E.V3n5iGT0mzWvEu	5	CLIENTE	t
22	Charlie Angel	Sheen	Ttwohalfofmen@mail.com	+1 243 234 23456	$2a$10$n5PLtraxVkHd.f4UA8dqQ.Qc86VfV8p8RcgKke.sLdy5iuAv18DwG	9	CLIENTE	t
33	Andres	Bonilla	andres.bonilla@mail.com	+30 23456712	$2a$10$CaGtnmEtt5wjJFO66U9ylOg7sPejmT4BxjCCl8juqA7BO4sLZZpni	17	CLIENTE	t
34	Ana María	Cazzu	anamari@mail.com	+50 2345-4586	$2a$10$AseRxQnyixpTIqsSKIvBfehQuNtACTwhJ8ivu/k/scIZutMQGy80C	5	CLIENTE	t
35	Mohamed	Adhulaj	mohamedgandhi@mail.com	+65 23458769	$2a$10$JUXuStJSKPXfPP28DTcVaO/e1ljbmRrIP3MSzIO9yWB/hyBwzAZma	18	CLIENTE	t
37	Jonas 	De La O III	jonasIII@mail.com	+21 2311 2345	$2a$10$Rx.WCq/dIaNB796laemTFuIXoPx7rrIBizUteGONJCX2VLi8ucpkS	13	CLIENTE	t
23	Domenico	Santorini	domenico.santorini@mail.com	+12 4080 345 234	$2a$10$z9kpmhe5YVCMmQCfnm4MheklAJtJ0M4eljTvNfBnVWeHz84iDd7kq	2	CLIENTE	t
24	Eduardo Francois	Camavinga	eduardo.camavinga@mail.com	+15 456 78904	$2a$10$vvErZZgREUaw1bCFgtiK5.K9CZfGFsv4U0tWbXfi1c8Cp3RhPCFem	10	CLIENTE	t
32	Miguel Angel	Bonilla 	miguelangelpintor@mail.com	+55 23456 234	$2a$10$EeJ2vZBe4vNH5P8KhlMlVenpjS9jfqwe0TdAEgwCrFk4QuC0WWY0m	15	CLIENTE	t
11	José Alfredo	López Rivera	administrador@mail.com	+503 7746-1397	$2a$10$Ov6XV5SmfpQepjXWKirHuOzbA9LwwDdPdm.ID3NKLO72wLvVlGomC	3	ADMINISTRADOR	t
\.


--
-- Name: auditlogs_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditlogs_audit_id_seq', 192, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 14, true);


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_id_seq', 22, true);


--
-- Name: entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entries_id_seq', 32, true);


--
-- Name: exits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exits_id_seq', 8, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 26, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 23, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 46, true);


--
-- Name: auditlogs auditlogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs
    ADD CONSTRAINT auditlogs_pkey PRIMARY KEY (audit_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);


--
-- Name: entries entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_pkey PRIMARY KEY (entry_id);


--
-- Name: exits exits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT exits_pkey PRIMARY KEY (exit_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: suppliers suppliers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_email_key UNIQUE (email);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: categories trg_audit_categories; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_categories AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: countries trg_audit_countries; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_countries AFTER INSERT OR DELETE OR UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: entries trg_audit_entries; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_entries AFTER INSERT OR DELETE OR UPDATE ON public.entries FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: exits trg_audit_exits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_exits AFTER INSERT OR DELETE OR UPDATE ON public.exits FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: products trg_audit_products; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_products AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: suppliers trg_audit_suppliers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_suppliers AFTER INSERT OR DELETE OR UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: users trg_audit_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: products fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: suppliers fk_country_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT fk_country_supplier FOREIGN KEY (country_id) REFERENCES public.countries(country_id);


--
-- Name: users fk_country_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_country_user FOREIGN KEY (country_id) REFERENCES public.countries(country_id);


--
-- Name: entries fk_product_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fk_product_entry FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: exits fk_product_exit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT fk_product_exit FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: products fk_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: products fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: entries fk_user_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fk_user_entry FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: exits fk_user_exit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT fk_user_exit FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: entries fkcgyu7y1pidyihfoltdfsktscy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fkcgyu7y1pidyihfoltdfsktscy FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- PostgreSQL database dump complete
--

\unrestrict JwiYp9cNQH4LaQoTpwojzmU92a4rIGUjH8Lbe2zHjD11lGuLcZ5rlQPx3ryNCvA

