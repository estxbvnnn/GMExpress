import { Link } from "react-router-dom";

const styles = {
	page: {
		fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
		display: "flex",
		flexDirection: "column",
		gap: 56,
		paddingBottom: 80,
	},
	section: {
		maxWidth: 1200,
		margin: "0 auto",
		padding: "0 24px",
	},
	hero: {
		minHeight: "78vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		color: "#fff",
		padding: "110px 24px 90px",
		backgroundImage:
			"linear-gradient(120deg, rgba(2,24,14,0.92), rgba(6,66,37,0.78)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=60')",
		backgroundSize: "cover",
		backgroundPosition: "center",
		borderRadius: "0 0 48px 48px",
	},
	tag: {
		display: "inline-flex",
		justifyContent: "center",
		alignItems: "center",
		padding: "6px 16px",
		borderRadius: 999,
		border: "1px solid rgba(255,255,255,0.45)",
		fontSize: 13,
		letterSpacing: 0.4,
		textTransform: "uppercase",
	},
	tagMuted: {
		borderColor: "rgba(255,255,255,0.15)",
		color: "#d6f5e8",
		background: "rgba(255,255,255,0.05)",
	},
	tagOutlined: {
		borderColor: "rgba(10,61,36,0.2)",
		color: "#0a3d24",
		background: "rgba(10,61,36,0.05)",
	},
	heroContent: {
		maxWidth: 840,
		display: "flex",
		flexDirection: "column",
		gap: 20,
	},
	heroTitle: {
		fontSize: "clamp(2.8rem, 3.8vw, 4.2rem)",
		lineHeight: 1.1,
		margin: 0,
	},
	heroCopy: {
		fontSize: "1.1rem",
		lineHeight: 1.7,
		margin: 0,
		opacity: 0.92,
	},
	btnRow: {
		display: "flex",
		gap: 16,
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: 10,
	},
	sectionHeader: {
		textAlign: "center",
		maxWidth: 720,
		margin: "0 auto 32px",
		display: "flex",
		flexDirection: "column",
		gap: 14,
	},
	sectionTitle: {
		fontSize: "2.3rem",
		margin: 0,
		color: "#082a1a",
	},
	sectionCopy: {
		margin: 0,
		color: "#4c5f55",
		lineHeight: 1.6,
	},
	statsBand: {
		position: "relative",
		padding: "72px 0",
		background: "linear-gradient(125deg, #f7fff9, #dfeee6)",
		overflow: "hidden",
		borderRadius: 40,
	},
	statsLayout: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
		gap: 32,
		alignItems: "center",
	},
	statsSummary: {
		background: "#fff",
		borderRadius: 28,
		padding: "32px 36px",
		boxShadow: "0 24px 55px rgba(9,72,40,0.12)",
		display: "flex",
		flexDirection: "column",
		gap: 18,
	},
	statsList: {
		margin: 0,
		paddingLeft: 18,
		color: "#375447",
		lineHeight: 1.5,
	},
	statsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
		gap: 18,
	},
	statsCard: {
		background: "#fff",
		borderRadius: 24,
		padding: 24,
		boxShadow: "0 14px 35px rgba(7, 69, 38, 0.12)",
		border: "1px solid rgba(10, 61, 36, 0.06)",
		display: "flex",
		flexDirection: "column",
		gap: 6,
	},
	statsIcon: {
		width: 48,
		height: 48,
		borderRadius: 14,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		background: "rgba(0, 168, 107, 0.14)",
		fontSize: "1.35rem",
		color: "#0a7a4d",
	},
	statsValue: {
		margin: "6px 0 2px",
		fontSize: "2.2rem",
		color: "#042e1a",
	},
	statsLabel: {
		margin: 0,
		fontWeight: 600,
		color: "#0f4a2b",
	},
	imageCard: {
		borderRadius: 20,
		overflow: "hidden",
		background: "#fff",
		boxShadow: "0 20px 45px rgba(15,40,32,0.12)",
		display: "flex",
		flexDirection: "column",
	},
	cardImage: {
		height: 180,
		backgroundSize: "cover",
		backgroundPosition: "center",
	},
	cardBody: {
		padding: 24,
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	benefits: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
		gap: 32,
		alignItems: "center",
	},
	benefitsImg: {
		borderRadius: 24,
		width: "100%",
		objectFit: "cover",
	},
	testimonials: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
		gap: 24,
	},
	quote: {
		borderRadius: 20,
		padding: 24,
		background: "#0b3b23",
		color: "#fff",
		lineHeight: 1.6,
		boxShadow: "0 20px 40px rgba(11,59,35,0.25)",
	},
	ctaFinal: {
		textAlign: "center",
		background: "#042414",
		color: "#fff",
		padding: "60px 24px",
		borderRadius: 32,
		margin: "0 24px",
	},
	btnBase: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		padding: "14px 32px",
		borderRadius: 999,
		fontWeight: 600,
		gap: 8,
		textDecoration: "none",
		boxShadow: "0 12px 24px rgba(4,32,20,0.15)",
		transition: "transform 0.25s ease, box-shadow 0.25s ease",
	},
	btnPrimary: {
		background: "linear-gradient(120deg,#3dd598,#00a86b)",
		color: "#041a11",
		border: "none",
	},
	btnSecondary: {
		background: "rgba(255,255,255,0.08)",
		border: "1px solid rgba(255,255,255,0.35)",
		color: "#f4fff6",
		backdropFilter: "blur(4px)",
	},
	btnLight: {
		background: "#fff",
		color: "#042414",
		border: "none",
	},
	btnOutline: {
		background: "transparent",
		border: "1px solid rgba(255,255,255,0.6)",
		color: "#fff",
	},
};

const FEATURED_CATEGORIES = [
	{
		title: "Alimentación transportada",
		description: "Menús diarios con control de temperatura y logística propia.",
		image:
			"https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=60",
	},
	{
		title: "Coffee break y eventos",
		description: "Montajes decorativos para reuniones y celebraciones corporativas.",
		image:
			"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=60",
	},
	{
		title: "Concesión de casinos",
		description: "Operación integral en colegios, universidades y centros laborales.",
		image:
			"https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=60",
	},
];

const BENEFITS = [
	"Recetas diseñadas por nutricionistas certificados.",
	"Distribución nacional con cadena de frío asegurada.",
	"Integración con paneles empresariales y seguimiento en línea.",
	"Equipo de soporte 24/7 para clientes corporativos.",
];

const TESTIMONIALS = [
	{
		name: "Consorcio Andino",
		role: "Gerencia de Personas",
		quote:
			"GM Express elevó la experiencia en nuestro casino corporativo: puntualidad, sabor y atención impecable.",
	},
	{
		name: "Colegio Horizonte",
		role: "Coordinación Académica",
		quote:
			"Los estudiantes valoran la variedad y el enfoque saludable de la concesión administrada por GM Express.",
	},
];

const KPI_STATS = [
	{
		value: "+250",
		label: "Menús activos",
		helper: "Rotación semanal curada por chefs",
		icon: "🍽️",
	},
	{
		value: "98%",
		label: "Satisfacción clientes",
		helper: "Encuestas trimestrales",
		icon: "💚",
	},
	{
		value: "24/7",
		label: "Soporte operativo",
		helper: "Mesa de ayuda corporativa",
		icon: "🕑",
	},
	{
		value: "8 regiones",
		label: "Cobertura logística",
		helper: "Red propia y partners",
		icon: "🚚",
	},
];

const IMPACT_HIGHLIGHTS = [
	"Operación auditada bajo BPM y trazabilidad digital completa.",
	"SLA logístico menor a 90 minutos en la Región Metropolitana.",
	"Mesa de ayuda y monitoreo 24/7 para cuentas corporativas.",
];

const Home = () => {
	const handleButtonHover = (event, hovered) => {
		event.currentTarget.style.transform = hovered ? "translateY(-2px) scale(1.01)" : "translateY(0)";
		event.currentTarget.style.boxShadow = hovered
			? "0 18px 30px rgba(4,36,20,0.25)"
			: styles.btnBase.boxShadow;
	};

	const getButtonProps = (variant = "btnPrimary") => ({
		style: { ...styles.btnBase, ...styles[variant] },
		onMouseEnter: (e) => handleButtonHover(e, true),
		onMouseLeave: (e) => handleButtonHover(e, false),
	});

	return (
		<div style={styles.page}>
			<section style={{ ...styles.hero, ...styles.section }}>
				<div style={styles.heroContent}>
					<div style={styles.tag}>Soluciones gastronómicas integrales</div>
					<h1 style={styles.heroTitle}>
						Alimentación corporativa con diseño, logística y tecnología
					</h1>
					<p style={styles.heroCopy}>
						Cubrimos casinos presenciales, servicios transportados, coffee break y concesiones
						educativas. Gestiona pedidos, proveedores y reportes desde un solo panel.
					</p>
					<div style={styles.btnRow}>
						<Link to="/catalogo" {...getButtonProps("btnPrimary")}>
							Explorar catálogo
						</Link>
						<Link to="/register" {...getButtonProps("btnSecondary")}>
							Regístrate aquí
						</Link>
					</div>
				</div>
			</section>

			<section style={{ ...styles.section, ...styles.statsBand }}>
				<div style={styles.statsLayout}>
					<div style={styles.statsSummary}>
						<div style={{ ...styles.tag, ...styles.tagMuted, alignSelf: "flex-start" }}>
							Impacto
						</div>
						<h2 style={styles.sectionTitle}>Operamos con métricas claras y auditables</h2>
						<p style={styles.sectionCopy}>
							Integramos cocina central, logística propia y mesa de ayuda para asegurar
							continuidad operacional y experiencia consistente en cada sede.
						</p>
						<ul style={styles.statsList}>
							{IMPACT_HIGHLIGHTS.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
					<div style={styles.statsGrid}>
						{KPI_STATS.map((stat) => (
							<article key={stat.label} style={styles.statsCard}>
								<span style={styles.statsIcon}>{stat.icon}</span>
								<h3 style={styles.statsValue}>{stat.value}</h3>
								<p style={styles.statsLabel}>{stat.label}</p>
								<small style={{ color: "#5c776b" }}>{stat.helper}</small>
							</article>
						))}
					</div>
				</div>
			</section>

			<section style={styles.section}>
				<div style={styles.sectionHeader}>
					<div style={{ ...styles.tag, ...styles.tagOutlined }}>Nuestras líneas</div>
					<h2 style={styles.sectionTitle}>Servicios que se adaptan a cada momento</h2>
					<p style={styles.sectionCopy}>
						Selecciona operaciones presenciales o transportadas, coffee breaks, snacks con tickets y
						concesiones educativas con seguimiento en tiempo real.
					</p>
				</div>
				<div style={styles.cardGrid}>
					{FEATURED_CATEGORIES.map((cat) => (
						<article key={cat.title} style={styles.imageCard}>
							<div style={{ ...styles.cardImage, backgroundImage: `url(${cat.image})` }} />
							<div style={styles.cardBody}>
								<h3 style={{ margin: 0, color: "#0e2b1b" }}>{cat.title}</h3>
								<p style={{ margin: 0, color: "#5c6e64", lineHeight: 1.6 }}>{cat.description}</p>
								<Link to="/catalogo" style={{ color: "#00a86b", fontWeight: 600 }}>
									Ver propuestas →
								</Link>
							</div>
						</article>
					))}
				</div>
			</section>

			<section style={styles.section}>
				<div style={styles.benefits}>
					<div>
						<h2 style={{ marginTop: 0, color: "#072614", fontSize: "2rem" }}>
							Pasamos del catering al acompañamiento integral
						</h2>
						<ul style={{ paddingLeft: 18, color: "#4c5f55", lineHeight: 1.7 }}>
							{BENEFITS.map((item) => (
								<li key={item} style={{ marginBottom: 10 }}>
									{item}
								</li>
							))}
						</ul>
						<p style={{ marginTop: 12, color: "#5c6e64" }}>
							Coordina nuevas solicitudes directamente con tu ejecutivo GM Express.
						</p>
					</div>
					<div>
						<img
							style={styles.benefitsImg}
							height={420}
							src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=60"
							alt="Equipo GM Express"
						/>
					</div>
				</div>
			</section>

			<section style={styles.section}>
				<div style={styles.sectionHeader}>
					<div style={{ ...styles.tag, ...styles.tagOutlined }}>Testimonios</div>
					<h2 style={styles.sectionTitle}>Lo que dicen nuestros aliados</h2>
					<p style={styles.sectionCopy}>
						Clientes corporativos y educativos que confían en GM Express por su capacidad operativa
						y acompañamiento continuo.
					</p>
				</div>
				<div style={styles.testimonials}>
					{TESTIMONIALS.map((testimonial) => (
						<blockquote key={testimonial.name} style={styles.quote}>
							<p style={{ marginTop: 0 }}>“{testimonial.quote}”</p>
							<footer style={{ marginTop: 18, opacity: 0.85 }}>
								<b>{testimonial.name}</b>
								<br />
								<small>{testimonial.role}</small>
							</footer>
						</blockquote>
					))}
				</div>
			</section>

			<section style={{ ...styles.section, ...styles.ctaFinal }}>
				<h2 style={{ fontSize: "2.2rem", marginBottom: 12 }}>
					¿Listo para diseñar tu próximo servicio?
				</h2>
				<p style={{ maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.6 }}>
					Explora el catálogo, arma tu carrito y gestiona solicitudes al equipo GM Express con
					seguimiento en línea y soporte dedicado.
				</p>
				<div style={{ ...styles.btnRow, justifyContent: "center" }}>
					<Link to="/catalogo" {...getButtonProps("btnLight")}>
						Descubrir catálogo
					</Link>
					<Link to="/login" {...getButtonProps("btnOutline")}>
						Ingresar al panel
					</Link>
				</div>
			</section>
		</div>
	);
};

export default Home;