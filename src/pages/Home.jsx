import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
	const { user } = useAuth();
	return (
		<div className="home-page">
			{/* HERO PRINCIPAL */}
			<section className="home-hero-band">
				<div className="home-hero-overlay" />
				<div className="home-hero-content">
					<div className="home-hero-text">
						<h1>
							Soluciones integrales en
							<br />
							<span>alimentación colectiva</span>
						</h1>
						<p>
							Casino GM Express entrega un servicio profesional y confiable en
							casinos de empresas, alimentación institucional y banquetería,
							con enfoque en calidad, seguridad e innovación.
						</p>
						<div className="hero-actions">
							<Link to="/catalogo" className="btn-primary">
								Ver catálogo de servicios
							</Link>
							{user ? (
								<>
									<Link to="/mis-pedidos" className="btn-secondary">
										Mis pedidos / historial
									</Link>
								</>
							) : (
								<Link to="/login" className="btn-secondary">
									Gestionar pedidos
								</Link>
							)}
						</div>
					</div>
					<div className="home-hero-info">
						<div className="home-hero-chip">
							<span className="chip-title">Servicio a empresas</span>
							<span className="chip-sub">
								Casinos corporativos, colegios y organismos públicos.
							</span>
						</div>
						<div className="home-hero-chip">
							<span className="chip-title">Banquetería y eventos</span>
							<span className="chip-sub">
								Coffe break, almuerzos ejecutivos y celebraciones.
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* FRANJA DE INDICADORES */}
			<section className="home-metrics">
				<div className="metric-item">
					<span className="metric-value">+10</span>
					<span className="metric-label">Años de experiencia</span>
				</div>
				<div className="metric-item">
					<span className="metric-value">24/7</span>
					<span className="metric-label">Operación y soporte</span>
				</div>
				<div className="metric-item">
					<span className="metric-value">100%</span>
					<span className="metric-label">Enfoque en seguridad alimentaria</span>
				</div>
			</section>

			{/* SERVICIOS PRINCIPALES */}
			<section className="home-services">
				<header className="section-header">
					<h2>Áreas de servicio</h2>
					<p>
						Diseñamos soluciones a la medida para cada necesidad: casinos
						empresariales, alimentación institucional y banquetería para eventos.
					</p>
				</header>
				<div className="home-services-grid">
					<article className="service-card">
						<h3>Casinos de empresa</h3>
						<p>
							Operación integral de casinos corporativos, con menús equilibrados,
							variedad diaria y cumplimiento estricto de normativa sanitaria.
						</p>
						<ul>
							<li>Diseño de carta y minutas mensuales</li>
							<li>Servicio en horario continuado</li>
							<li>Supervisión en terreno</li>
						</ul>
					</article>
					<article className="service-card">
						<h3>Banquetería y eventos</h3>
						<p>
							Soluciones para reuniones, capacitaciones y celebraciones, con
							coffe break, cócteles y almuerzos ejecutivos.
						</p>
						<ul>
							<li>Coffe break corporativo</li>
							<li>Cóctel y finger food</li>
							<li>Almuerzos y cenas formales</li>
						</ul>
					</article>
					<article className="service-card">
						<h3>Alimentación institucional</h3>
						<p>
							Servicios de alimentación para instituciones educacionales,
							organismos públicos y programas especiales.
						</p>
						<ul>
							<li>Adaptación a requerimientos nutricionales</li>
							<li>Control de calidad permanente</li>
							<li>Reportes y trazabilidad</li>
						</ul>
					</article>
				</div>
			</section>
		</div>
	);
};

export default Home;