--
-- PostgreSQL database dump
--

\restrict vgMJ5vHQrpjMrNvgDnHCmelQPg7uhxtmTB00oa7afh9J9r2sGsR3dkxfwF5ba8m

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-06-10 17:53:04

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
-- TOC entry 244 (class 1255 OID 91457)
-- Name: clean_all_tables_spaces(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clean_all_tables_spaces() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    col_name TEXT;
    col_value TEXT;
    updated_json JSONB;
BEGIN
    -- Inicializamos el JSONB con los datos del registro NEW
    updated_json := to_jsonb(NEW);

    -- Recorremos todas las columnas de tipo texto de la tabla que disparó el trigger
    FOR col_name IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
          AND table_name = TG_TABLE_NAME 
          AND data_type IN ('character varying', 'character', 'text')
    LOOP
        -- Extraemos el valor actual de la columna
        col_value := updated_json ->> col_name;
        
        -- Si el campo contiene texto, le aplicamos el TRIM
        IF col_value IS NOT NULL THEN
            updated_json := updated_json || jsonb_build_object(col_name, TRIM(col_value));
        END IF;
    END LOOP;

    -- CORRECCIÓN: Usamos jsonb_populate_record para que sea 100% compatible
    NEW := jsonb_populate_record(NEW, updated_json);

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.clean_all_tables_spaces() OWNER TO postgres;

--
-- TOC entry 245 (class 1255 OID 83241)
-- Name: process_auditlogs(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_auditlogs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    session_user_id_str VARCHAR(255);
    final_user_display VARCHAR(255);
    resolved_entity_id BIGINT;
    final_action VARCHAR(20); -- Nueva variable para guardar la acción real
BEGIN
    -- 1. Capturar el ID de la sesión enviado por Spring Boot
    BEGIN
        session_user_id_str := NULLIF(current_setting('app.current_user_id', true), '');
    EXCEPTION WHEN OTHERS THEN
        session_user_id_str := NULL;
    END;

    -- 2. Buscar el nombre del usuario logueado en la tabla users
    IF session_user_id_str IS NOT NULL THEN
        SELECT name || ' ' || COALESCE(last_name, '') INTO final_user_display
        FROM public.users 
        WHERE user_id = session_user_id_str::BIGINT;
        
        IF final_user_display IS NULL OR TRIM(final_user_display) = '' THEN
            final_user_display := 'Usuario ID: ' || session_user_id_str;
        END IF;
    ELSE
        IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'users' THEN
            final_user_display := NEW.name || ' ' || COALESCE(NEW.last_name, '') || ' (Auto-registro)';
        ELSE
            final_user_display := 'Sistema';
        END IF;
    END IF;

    -- 3. Mapeo TOTAL y EXPLÍCITO de llaves primarias por tabla
    IF (TG_OP = 'DELETE') THEN
        IF TG_TABLE_NAME = 'users' THEN resolved_entity_id := OLD.user_id;
        ELSIF TG_TABLE_NAME = 'categories' THEN resolved_entity_id := OLD.category_id;
        ELSIF TG_TABLE_NAME = 'products' THEN resolved_entity_id := OLD.product_id;
        ELSIF TG_TABLE_NAME = 'countries' THEN resolved_entity_id := OLD.country_id;
        ELSIF TG_TABLE_NAME = 'entries' THEN resolved_entity_id := OLD.entry_id;
        ELSIF TG_TABLE_NAME = 'exits' THEN resolved_entity_id := OLD.exit_id;
        ELSIF TG_TABLE_NAME = 'suppliers' THEN resolved_entity_id := OLD.supplier_id;
        ELSE resolved_entity_id := OLD.id;
        END IF;
    ELSE
        IF TG_TABLE_NAME = 'users' THEN resolved_entity_id := NEW.user_id;
        ELSIF TG_TABLE_NAME = 'categories' THEN resolved_entity_id := NEW.category_id;
        ELSIF TG_TABLE_NAME = 'products' THEN resolved_entity_id := NEW.product_id;
        ELSIF TG_TABLE_NAME = 'countries' THEN resolved_entity_id := NEW.country_id;
        ELSIF TG_TABLE_NAME = 'entries' THEN resolved_entity_id := NEW.entry_id;
        ELSIF TG_TABLE_NAME = 'exits' THEN resolved_entity_id := NEW.exit_id;
        ELSIF TG_TABLE_NAME = 'suppliers' THEN resolved_entity_id := NEW.supplier_id;
        ELSE resolved_entity_id := NEW.id;
        END IF;
    END IF;

    -- 4. DETECTAR BORRADO LÓGICO (Mejora solicitada)
    final_action := TG_OP; -- Por defecto toma INSERT, UPDATE o DELETE fijo.

    IF TG_OP = 'UPDATE' THEN
        -- Si el registro estaba activo (true) y pasa a estar inactivo (false), fue un borrado lógico
        IF OLD.active = true AND NEW.active = false THEN
            final_action := 'DELETE';
        -- Por si acaso: si lo reactivan en el futuro, se guardará como un 'RESTORE' o 'UPDATE'
        ELSIF OLD.active = false AND NEW.active = true THEN
            final_action := 'RESTORE'; 
        END IF;
    END IF;

    -- 5. Inserción en la tabla auditlogs usando la acción corregida
    INSERT INTO public.auditlogs (entity, entity_id, action, user_id, created_at)
    VALUES (TG_TABLE_NAME, resolved_entity_id, final_action, final_user_display, CURRENT_TIMESTAMP);

    -- 6. Retorno reglamentario
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.process_auditlogs() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 58661)
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
-- TOC entry 231 (class 1259 OID 58660)
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
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 231
-- Name: auditlogs_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditlogs_audit_id_seq OWNED BY public.auditlogs.audit_id;


--
-- TOC entry 224 (class 1259 OID 42499)
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
-- TOC entry 223 (class 1259 OID 42498)
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
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.category_id;


--
-- TOC entry 218 (class 1259 OID 42458)
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
-- TOC entry 217 (class 1259 OID 42457)
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
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 217
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.country_id;


--
-- TOC entry 228 (class 1259 OID 42527)
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
-- TOC entry 227 (class 1259 OID 42526)
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
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 227
-- Name: entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entries_id_seq OWNED BY public.entries.entry_id;


--
-- TOC entry 230 (class 1259 OID 42544)
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
-- TOC entry 229 (class 1259 OID 42543)
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
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 229
-- Name: exits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exits_id_seq OWNED BY public.exits.exit_id;


--
-- TOC entry 226 (class 1259 OID 42508)
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
-- TOC entry 225 (class 1259 OID 42507)
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
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 225
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 222 (class 1259 OID 42483)
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
-- TOC entry 221 (class 1259 OID 42482)
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
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 221
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.supplier_id;


--
-- TOC entry 220 (class 1259 OID 42467)
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
    role character varying(255) DEFAULT 'CLIENTE'::character varying,
    active boolean DEFAULT true,
    CONSTRAINT chk_rol CHECK (((role)::text = ANY ((ARRAY['CLIENTE'::character varying, 'ADMINISTRADOR'::character varying, 'SOPORTE'::character varying, 'EMPLEADO'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 42466)
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
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4747 (class 2604 OID 58668)
-- Name: auditlogs audit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs ALTER COLUMN audit_id SET DEFAULT nextval('public.auditlogs_audit_id_seq'::regclass);


--
-- TOC entry 4739 (class 2604 OID 58613)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4732 (class 2604 OID 58630)
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- TOC entry 4743 (class 2604 OID 58536)
-- Name: entries entry_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries ALTER COLUMN entry_id SET DEFAULT nextval('public.entries_id_seq'::regclass);


--
-- TOC entry 4745 (class 2604 OID 58543)
-- Name: exits exit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits ALTER COLUMN exit_id SET DEFAULT nextval('public.exits_id_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 58583)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4737 (class 2604 OID 58518)
-- Name: suppliers supplier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN supplier_id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 58550)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4954 (class 0 OID 58661)
-- Dependencies: 232
-- Data for Name: auditlogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditlogs (audit_id, entity, entity_id, user_id, action, created_at) FROM stdin;
1	countries	20	Sistema	RESTORE	2026-06-10 19:45:25.494403
2	countries	21	Sistema	RESTORE	2026-06-10 19:45:25.494403
3	products	23	Sistema	RESTORE	2026-06-10 19:47:42.048765
4	products	24	Sistema	RESTORE	2026-06-10 19:47:42.048765
\.


--
-- TOC entry 4946 (class 0 OID 42499)
-- Dependencies: 224
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, name, description, active) FROM stdin;
3	Verduras	Verduras nacionales	t
6	Carnes	categoria de carnes nacionales e importadas	t
7	Harinas	Harinas en general(arroz, trigo, maiz)	t
8	Bebidas	Bebidas en general, nacionales e importadas	t
1	Frutas	Frutas nacionales o importadas	t
2	Leches	Todo tipo de leches, liquidas y en polvo	t
10	Cereales	categoria de Cereales nacionales e importados	t
11	Papel	Papel de baño o para cocina importado y nacional	t
12	Pastas	Pastas importadas o nacionales	t
13	Granos basicos	Todo lo relacionado, con frijoles, arroz, maíz, maicillo, entre otros.	t
14	Pan	Pan en general, importado o nacional	t
15	Aceites	Aceite en general, importado y nacional	t
16	Cervezas	Cervezas en todas las presentaciones, importadas y nacionales.	t
17	Snacks	Todo tipo de snack.	t
9	Galletas	Galletas en general, importadas o nacionales	t
\.


--
-- TOC entry 4940 (class 0 OID 42458)
-- Dependencies: 218
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (country_id, name, description, active) FROM stdin;
4	Colombia	Pais grande, ubicado en America del Sur, provee diferentes productos	t
5	Argentina	Pais grande, ubicado en America del Sur, provee diferentes productos carnicos	t
1	Estados Unidos	País grande, provee diferentes productos entre ellos harina	t
7	Brasil	País grande de America del Sur, provee principalmente coco	t
8	Guatemala	País pequeño ubicado en América Central, provee frutas y verduras	t
15	Mexico	País grande, proveedor de productos en general	t
2	Australia	País grande, provee diferentes productos entre ellos carnes y leches	t
17	Inglaterra	País registrado automáticamente: Inglaterra	t
18	Egipto	País registrado automáticamente: Egipto	t
19	Rusia	País grande, abastece varios productos, entre ellos lácteos y harinas	t
22	España	Pais creado automaticamente desde el modulo de proveedores	t
10	Francia	País de Europa, abastece de productos elaborados de harina	t
3	El Salvador	País pequeño ubicado en América Central, provee diferentes productos	t
11	Alemania	País de Europa, abastece principalmente bebidas	t
12	Japón	País asiático, abastece de diferentes productos.	t
13	Honduras	País de Centro America, abastece de productos principalmente granos básicos.	t
14	Costa Rica	País creado automáticamente desde el módulo de proveedores	t
9	Italia	País de Europa, abastece pastas y harinas principalmente.	t
20	Nicaragua	País registrado automáticamente: Nicaragua	t
21	Uruguay	País de America del Sur, abastece principalmente bebidas.	t
\.


--
-- TOC entry 4950 (class 0 OID 42527)
-- Dependencies: 228
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
33	2026-06-10 16:25:45.566444	30	7.45	27	11	24	t
34	2026-06-10 16:37:22.522637	25	0.75	28	11	23	t
36	2026-06-10 17:13:22.63413	35	5.25	30	11	23	t
\.


--
-- TOC entry 4952 (class 0 OID 42544)
-- Dependencies: 230
-- Data for Name: exits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exits (exit_id, exit_date, quantity, product_id, user_id, active) FROM stdin;
4	2026-05-07 17:05:06.833084	50	3	4	t
3	2026-05-07 16:30:33.261193	25	3	11	t
6	2026-06-03 17:20:39.558026	20	13	11	t
8	2026-06-05 17:23:13.05294	10	26	11	t
5	2026-06-02 20:15:39.12912	35	3	13	t
7	2026-06-05 16:34:17.880403	5	20	11	t
2	2026-04-30 16:53:35.976754	25	8	11	t
9	2026-06-08 10:43:03.158568	4	22	11	t
10	2026-06-10 17:19:03.454058	3	16	20	t
11	2026-06-10 17:25:12.547374	10	27	11	t
12	2026-06-10 17:43:59.078201	10	8	20	t
\.


--
-- TOC entry 4948 (class 0 OID 42508)
-- Dependencies: 226
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (product_id, name, price, current_stock, image_url, description, category_id, supplier_id, user_id, active) FROM stdin;
8	Harina de maiz	3.20	15	https://walmarthn.vtexassets.com/arquivos/ids/187380/Harina-De-Maiz-Maseca-Bolsa-454-Gr-1-10138.jpg?v=637708274553530000\t	Harina de maiz en presentacion de 2 libras	7	8	9	t
28	Cerveza pilsener 12 pack	10.75	25	https://tse1.mm.bing.net/th/id/OIP.kxLyj5FxIVMT3CYXPFsRYAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Cerveza pilsener en presentación de 12 unidades lata	16	23	11	t
6	Mango Zazón	1.25	100	https://tse1.explicit.bing.net/th/id/OIP.yyegoUwFvJsi_MzcQmDxsAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Mango verde nacional	1	3	18	t
20	Carne de Res Americana	11.45	25	https://tse2.mm.bing.net/th/id/OIP.QwriN6M2F8ZfGe6XvnB0fgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Libra de carne de res americano, Reeb eye	6	4	18	t
14	Naranja Orange One	2.25	50	https://tse4.mm.bing.net/th/id/OIP.45JAxq9dPUnHcvZ7HRzI-AHaEA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Naranja en presentacion de 1kg	1	3	13	t
15	Carne de Cerdo ahumado	10.50	45	https://tse3.mm.bing.net/th/id/OIP.10HOqjauptCpa0PvEaNyaAHaET?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Lomo de cerdo en presentación de 1kg	6	4	20	t
22	Lechuga Fresh Green	1.65	76	https://tse1.mm.bing.net/th/id/OIP.ViuwTjeGQcNf08UgY3KDagAAAA?r=0&w=320&h=320&rs=1&pid=ImgDetMain&o=7&rm=3	Lechuga fresca nacional precio por unidad	3	3	11	t
2	Pera Onn	0.75	55	https://grupodispersa.com.gt/wp-content/uploads/2016/01/1-pera-Anjou-verde.jpg	Pera importada clase A (precio por unidad)	1	3	31	t
17	Coca Cola Original	1.00	35	https://tse1.mm.bing.net/th/id/OIP.O50AMYWjVR80Ua8LP2macgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Gaseosa Coca Cola original, presentación en lata 354 ml	8	17	11	t
13	Galleta OREO	3.25	80	https://th.bing.com/th/id/R.83e51105157978b422492a7505ea3b0b?rik=sr0aCtA0v7TLtw&riu=http%3a%2f%2fweb.superboom.net%2fweb%2fimage%2fproduct.template%2f38639%2fimage_1024%3funique%3dce4827a&ehk=%2fWA44uiXyLEOQzE%2bcaCtaRXY7j6nJmLCo20ShL25KEo%3d&risl=&pid=ImgRaw&r=0	Galleta de chocolate en paquetes de 12 unidades	9	10	13	t
16	Pollo Indio	6.85	37	https://tse2.mm.bing.net/th/id/OIP.RmvqQEUlhn_b9z6UpatbIwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Pollo Indio fresco en presentación entero	6	4	11	t
25	Salsa Ranchera	1.15	70	https://walmartgt.vtexassets.com/arquivos/ids/774170/32863_01.jpg?v=638768031123630000	Salsa ranchera 180g, producto nacional	12	22	20	t
18	Cereal Zucaritas	2.85	25	https://tse2.mm.bing.net/th/id/OIP.fDqw25mnlyS6GL1J58DxggHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	cereal en presentación de 620 g	10	16	11	t
19	Cereal Zucaritas Clasico	3.85	0	https://tse3.mm.bing.net/th/id/OIP.5mcVa3kaGxjfCnMfJncXFgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	cereal en presentación de 620 g clasico	10	16	11	t
3	Leche en polvo Australian 1Kg	2.55	190	https://cdn.phototourl.com/free/2026-05-19-30e9bd36-0465-4c2d-b73f-6ee0e12615e4.jpg	Leche importada desde Australia	2	1	4	t
21	Fresa One piece	1.35	30	https://ecommerce.surtifamiliar.com/backend/admin/backend/web/archivosDelCliente/items/images/Frutas-Frutas-empacadas-FRESA-BANDEJA-313820201112180102.jpg	Bandeja de fresas en presentación de una libra	1	3	30	t
26	Cereal Zucaritas Especial	3.75	20	https://tse4.mm.bing.net/th/id/OIP.X0eHYhdFLoH20t7ePy16qQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Cereal zucaritas presentación de 500g	10	18	11	t
30	Cerveza Golden 6 pack	5.25	35	https://tse1.mm.bing.net/th/id/OIP.S-nN4O7RBgvAfFlplMJYgAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Cerveza Golden lata 6 unidades	16	23	11	t
9	Harina de trigo	2.50	85	https://convy.mx/cdn/shop/products/70501659.jpg?v=1636474778	Harina de trigo en presentacion de 1 libra	7	8	1	t
12	Harina de Arroz	1.25	110	https://cdn.phototourl.com/free/2026-05-19-27d85ba2-7221-4e64-b2f0-32661965a0d4.jpg	Harina de arroz blanco en presentación de una libra	7	9	11	t
27	Aceite de oliva	7.45	23	https://tse2.mm.bing.net/th/id/OIP.MmyatLNCha0NI74gzwpJ2gHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Aceite de olivas extra virgen en presentación de 250ml	15	24	11	t
1	Manzana Roja	0.60	150	https://tse1.mm.bing.net/th/id/OIP.LAlScQZ3K4VPUUJ35dVUgQHaFl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	Manzana importada desde Estados Unidos.	1	2	9	t
23	Papel higienico	4.50	35	https://tse4.mm.bing.net/th/id/OIP.DHipxUH3W7eOBlxXNk8SugHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3	En presentación de 12 rollos extra suave	11	21	11	t
24	Papel toalla	3.10	25	https://th.bing.com/th/id/R.09b51dddf3d9881e4e518464f8b1054e?rik=Fy9GSJwiRHHXxw&pid=ImgRaw&r=0	En presentación de 6 rollos	11	21	9	t
\.


--
-- TOC entry 4944 (class 0 OID 42483)
-- Dependencies: 222
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (supplier_id, name, last_name, phone, email, address, country_id, active) FROM stdin;
4	Rancho 17	SA de CV	2340-2340	rancho17@mail.com	calle al tamarindo, Mendoza	5	t
2	Distribuidora del Campo	SA de CV	+1 479-421-8900	distribuidora.delcampo@mail.com	City of Arkansas	1	t
7	Yes	El Salvador	2345-0080	yes.elsalvador@mail.com	Carretera a Sonsonate, km 23 1/2, Zona industrial	3	t
8	MASECA	SA de CV	2545-8976	maseca.harinas@mail.com	Zona Franca #1, carretera Comalapa, Olocuilta	3	t
9	Doña Blanca	El Salvador	+503 2543-1234	harinas.doñablanca@mail.com	Parque Industrial, km 13 carretera a Santa Tecla, La Libertad	3	t
10	Galletas OREO	SA de CV	+52 456789 234	galletasoreo@mail.com	Ciudad de Mexico, Mexico	15	t
3	Del Monte	Frutas y verduras	+503 2348-7645	delmonte.salvadorena@mail.com	carretera a Rio Chiquito, Chalatenango	3	t
17	The Coca Cola	Company Ltd	+1 345 234 1234	thecocacola@mail.com	1001 East Boulevar, Los Angeles, California	1	t
18	Kelloggs	Company Ltd	+55 2345 1234	kelloggscereales@mail.com	Av. La Revolución, Ciudad de Mexico	15	t
20	Selecta	Global Productos	+55 45768798	selectaproductos@mail.com	Av. Los Girasoles #1500, Ciudad de Nuevo Leon	15	t
21	Scott	Company Ltd.	+56 4567 3456	scottcompanyglobal@mail.com	Av. Los Girasoles 1234 Madrid	22	t
1	Australian	Leches SA de CV	+61 452490-6789	leches.australian@mail.com	195 Marine Paradise, Camberra	2	t
22	Salsas Naturas	SA de CV	+503 2500-5467	naturas@mail.com	Av. Los Sisimiles #229, San Salvador	3	t
23	Cervecería	El Salvador	+503 2340-4567	cerveceriaelsalvador@mail.com	Calle a Santa Tecla, La Libertad	3	t
16	Selecta	Alimentos	+24 2345 8987	selectaAlimentos@mail.com	Av. Benito Juarez 1586, Ciudad Juarez	15	t
19	La Granja	Hermanos Ltd.	+503 2543-6787	lagranjahermanos@mail.com	Canton Matazano, calle al Jicaro, Quezaltepeque	3	t
24	Olivas	Company Garden	+505 6745-8734	olivascompany@mail.com	Ciudad de Managua	20	t
\.


--
-- TOC entry 4942 (class 0 OID 42467)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, last_name, email, phone, password, country_id, role, active) FROM stdin;
50	Alejandro	Carreras	alejandrocarreras@mail.com	+23 6746353	$2a$10$ooPnJCv3NcALwxt9VToVJ.GH0w3Mq7aIg3pSHS7v/gKycfKGgTAzy	22	CLIENTE	t
30	Anibal de la Fuente	Gaitán	anibalgaitan@mail.com	+55 2345674567	$2a$10$gF3YaOUSOXfCdYCvCFWzjeZNGqNCAWnXQTrULqyZYSbK8kD6Wkx5m	15	CLIENTE	t
51	Carlos	Melendez	carlosmelendez@mail.com	+503 2345 1234	$2a$10$nyC58okpIW7gI3X5bUgiVutdeaWhvQ60WkwIRDTQ.Torrmh3SUBvS	3	CLIENTE	t
44	Alirio	Menjivar	alirioperafancho@mail.com	+505 2345-2312	$2a$10$6QjSZ.haq/BVwDvMJi/Ny.oHopYbQ5RWOOxlxxXiS.5ZkS46Gm5F2	20	CLIENTE	t
27	Hiziro Hatuke	Wataro	hiziro.wataro@mail.com	+234 456789	$2a$10$6i3KLNsjr/PDQakegBTaFON4tNhD9L7eGdPAwiIG.qCwxiiQnvpbO	12	CLIENTE	t
31	Josep Albert	MackNail	josepalbert@mail.com	+33 78653-13243	$2a$10$kYiHyHGWYKI9RkiMJAwQC.vS1ViAEbPwJoMHyYUjC2PIQgGux9Btm	10	ADMINISTRADOR	t
45	Aquile Alexander	Bonaventura	aquilealexander@mail.com	+39 3456124567	$2a$10$bnRX6CtEr5jSvt3o3eyg2OkN/HdtTuag0b44uhogMI7SjJmxS6Bhm	9	SOPORTE	t
36	Alexander	Milinkovic	alexandermilinkovic@mail.com	+902 57483746 232	$2a$10$SOx6WVpB0uhCPRosXTIazuZvTzpXSydbZ8ranLzb9kKykGKKxu2Ti	19	SOPORTE	t
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
37	Jonas	De La O III	jonasIII@mail.com	+21 2311 2345	$2a$10$Rx.WCq/dIaNB796laemTFuIXoPx7rrIBizUteGONJCX2VLi8ucpkS	13	CLIENTE	t
23	Domenico	Santorini	domenico.santorini@mail.com	+12 4080 345 234	$2a$10$z9kpmhe5YVCMmQCfnm4MheklAJtJ0M4eljTvNfBnVWeHz84iDd7kq	2	CLIENTE	t
32	Miguel Angel	Bonilla	miguelangelpintor@mail.com	+55 23456 234	$2a$10$EeJ2vZBe4vNH5P8KhlMlVenpjS9jfqwe0TdAEgwCrFk4QuC0WWY0m	15	CLIENTE	t
11	José Alfredo	López Rivera	administrador@mail.com	+503 7746-1397	$2a$10$Ov6XV5SmfpQepjXWKirHuOzbA9LwwDdPdm.ID3NKLO72wLvVlGomC	3	ADMINISTRADOR	t
48	Agustin	Perez	agustin.perez48@mail.com	+1 2345678	123456	1	CLIENTE	t
99	Prueba	Docker	prueba.docker@mail.com	123	123	1	CLIENTE	t
49	Jimena Alexandre	Butoski	jimenabutoski@mail.com	+7 67456 1234	$2a$10$Eddf4vDOE7xHtUyvIX9tn.ZzTS0d1N28XqLHUlUmc3bMgrJHhbomu	19	SOPORTE	t
24	Eduardo Francois	Camavinga III	eduardo.camavinga@mail.com	+15 456 78904	$2a$10$vvErZZgREUaw1bCFgtiK5.K9CZfGFsv4U0tWbXfi1c8Cp3RhPCFem	10	CLIENTE	t
\.


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 231
-- Name: auditlogs_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditlogs_audit_id_seq', 4, true);


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 17, true);


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 217
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_id_seq', 22, true);


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 227
-- Name: entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entries_id_seq', 36, true);


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 229
-- Name: exits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exits_id_seq', 12, true);


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 225
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 30, true);


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 221
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 24, true);


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 51, true);


--
-- TOC entry 4769 (class 2606 OID 58670)
-- Name: auditlogs auditlogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs
    ADD CONSTRAINT auditlogs_pkey PRIMARY KEY (audit_id);


--
-- TOC entry 4761 (class 2606 OID 58615)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4751 (class 2606 OID 58632)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);


--
-- TOC entry 4765 (class 2606 OID 58538)
-- Name: entries entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_pkey PRIMARY KEY (entry_id);


--
-- TOC entry 4767 (class 2606 OID 58545)
-- Name: exits exits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT exits_pkey PRIMARY KEY (exit_id);


--
-- TOC entry 4763 (class 2606 OID 58585)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4757 (class 2606 OID 42697)
-- Name: suppliers suppliers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_email_key UNIQUE (email);


--
-- TOC entry 4759 (class 2606 OID 58520)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- TOC entry 4753 (class 2606 OID 75062)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4755 (class 2606 OID 58552)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4786 (class 2620 OID 91456)
-- Name: categories trg_audit_categories; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_categories AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4780 (class 2620 OID 91452)
-- Name: countries trg_audit_countries; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_countries AFTER INSERT OR DELETE OR UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4790 (class 2620 OID 91454)
-- Name: entries trg_audit_entries; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_entries AFTER INSERT OR DELETE OR UPDATE ON public.entries FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4792 (class 2620 OID 91455)
-- Name: exits trg_audit_exits; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_exits AFTER INSERT OR DELETE OR UPDATE ON public.exits FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4788 (class 2620 OID 91450)
-- Name: products trg_audit_products; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_products AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4784 (class 2620 OID 91453)
-- Name: suppliers trg_audit_suppliers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_suppliers AFTER INSERT OR DELETE OR UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4782 (class 2620 OID 91449)
-- Name: users trg_audit_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.process_auditlogs();


--
-- TOC entry 4787 (class 2620 OID 91466)
-- Name: categories trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4781 (class 2620 OID 91467)
-- Name: countries trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4791 (class 2620 OID 91468)
-- Name: entries trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.entries FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4793 (class 2620 OID 91469)
-- Name: exits trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.exits FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4789 (class 2620 OID 91465)
-- Name: products trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4785 (class 2620 OID 91470)
-- Name: suppliers trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4783 (class 2620 OID 91471)
-- Name: users trg_clean_spaces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_clean_spaces BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.clean_all_tables_spaces();


--
-- TOC entry 4772 (class 2606 OID 58616)
-- Name: products fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- TOC entry 4771 (class 2606 OID 58633)
-- Name: suppliers fk_country_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT fk_country_supplier FOREIGN KEY (country_id) REFERENCES public.countries(country_id);


--
-- TOC entry 4770 (class 2606 OID 58638)
-- Name: users fk_country_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_country_user FOREIGN KEY (country_id) REFERENCES public.countries(country_id);


--
-- TOC entry 4775 (class 2606 OID 58586)
-- Name: entries fk_product_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fk_product_entry FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 4778 (class 2606 OID 58591)
-- Name: exits fk_product_exit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT fk_product_exit FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 4773 (class 2606 OID 58521)
-- Name: products fk_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- TOC entry 4774 (class 2606 OID 58647)
-- Name: products fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4776 (class 2606 OID 58553)
-- Name: entries fk_user_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fk_user_entry FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4779 (class 2606 OID 58558)
-- Name: exits fk_user_exit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exits
    ADD CONSTRAINT fk_user_exit FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4777 (class 2606 OID 58526)
-- Name: entries fkcgyu7y1pidyihfoltdfsktscy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT fkcgyu7y1pidyihfoltdfsktscy FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


-- Completed on 2026-06-10 17:53:04

--
-- PostgreSQL database dump complete
--

\unrestrict vgMJ5vHQrpjMrNvgDnHCmelQPg7uhxtmTB00oa7afh9J9r2sGsR3dkxfwF5ba8m

