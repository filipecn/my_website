# PUBLICATIONS
---
{{<disclaimer text="This site contains PDF files of articles that are covered by copyright. You may browse the articles at your convenience in the same spirit as you may read a journal or conference proceedings in a public library. Retrieving, copying, distributing these files, entirely or in parts, may violate copyright protection laws." >}}

---
{{< papercard  title="Digital Animation of Powder-Snow Avalanches" 
abstract="Powder-snow avalanches are natural phenomena that result from an instability in the snow cover on a mountain relief. It begins with a dense avalanche core moving fast down the mountain. During its evolution, the snow particles in the avalanche front mix with the air, forming a suspended turbulent cloud of snow dust surrounding the dense snow avalanche. This paper introduces a physically-based framework using the Finite Volume Method to simulate powder-snow avalanches under complex terrains. Specifically, the primary goal is to simulate the turbulent snow cloud dynamics within the avalanche in a visually realistic manner. Our approach relies on a multi-layer model that splits the avalanche into two main layers: dense and powder-snow. The dense-snow layer flow is simulated by solving a type of Shallow Water Equations suited for intricate basal surfaces, known as the Savage-Hutter model. The powder-snow layer flow is modeled as a two-phase mixture of miscible fluids and simulated using Navier-Stokes equations. Moreover, we propose a novel model for the transition layer, which is responsible for coupling the avalanche main layers, including the snow mass injected into the powder-snow cloud from the snow entrainment processes and its injection velocity. In brief, our framework comprehensively simulates powder-snow avalanches, allowing us to render convincing animations of one of the most complex gravity-driven flows." 
conference="ACM Transactions on Graphics - SIGGRAPH 2025" 
doi="https://dl.acm.org/doi/10.1145/3730862"
src="../img/siggraph-2025.png" 
pdf="https://filipecn.github.io/psa_anim/static/pdf/psa_anim.pdf" 
video="https://www.youtube.com/watch?v=rHvtYA-lLIk&feature=youtu.be" 
webpage="https://filipecn.github.io/psa_anim/" 
a1="Filipe Nascimento" 
a2link="https://sites.google.com/icmc.usp.br/fssousa/home" a2="Fabricio S. Sousa"
a3link="http://www.icmc.usp.br/%7Eapneto/" a3="Afonso Paiva" >}}

---


---
{{< papercard  title="RBF Liquids: An Adaptive PIC Solver Using RBF-FD" 
abstract="We introduce a novel liquid simulation approach that combines a spatially adaptive pressure projection solver with the Particle-in-Cell (PIC) method. The solver relies on a generalized version of the Finite Difference (FD) method to approximate the pressure field and its gradients in tree-based grid discretizations, possibly non-graded. In our approach, FD stencils are computed by using meshfree interpolations provided by a variant of Radial Basis Function (RBF), known as RBF-Finite-Difference (RBF-FD). This meshfree version of the FD produces differentiation weights on scattered nodes with high-order accuracy. Our method adapts a quadtree/octree dynamically in a narrow-band around the liquid interface, providing an adaptive particle sampling for the PIC advection step. Furthermore, RBF affords an accurate scheme for velocity transfer between the grid and particles, keeping the system’s stability and avoiding numerical dissipation. We also present a data structure that connects the spatial subdivision of a quadtree/octree with the topology of its corresponding dual-graph. Our data structure makes the setup of stencils straightforward, allowing its updating without the need to rebuild it from scratch at each time-step. We show the effectiveness and accuracy of our solver by simulating incompressible inviscid fluids and comparing results with regular PIC-based solvers available in the literature." 
conference="ACM Siggraph Asia 2020 | ACM Transactions on Graphics" 
doi="https://dl.acm.org/doi/10.1145/3414685.3417794"
src="../img/siggraph-2020.png" 
pdf="https://rnakanishi.github.io/files/rbf-sa2020.pdf" 
video="https://www.youtube.com/watch?v=JVt8NoF81uI" 
webpage="https://rnakanishi.github.io/publications/rbf-liquids-adaptive-pic-solver-using-rbf/" 
a1link="https://rnakanishi.github.io/" a1="Rafael Nakanishi" 
a2="Filipe Nascimento" 
a3link="https://www.campos.cc/" a3="Rafael Campos"
a4link="http://www.facom.ufms.br/~pagliosa/" a4="Paulo Pagliosa"
a5link="http://www.icmc.usp.br/%7Eapneto/" a5="Afonso Paiva" >}}

---

{{< papercard  title="Approximating implicit curves on plane and surface triangulations with affine arithmetic" 
abstract="We present a spatially and geometrically adaptive method for computing a robust polygonal approximation of an implicit curve defined on a planar region or on a triangulated surface. Our method uses affine arithmetic to identify regions where the curve lies inside a thin strip. Unlike other interval methods, even those based on affine arithmetic, our method works on both rectangular and triangular decompositions and can use any refinement scheme that the decomposition offers." 
conference="Computers & Graphics 40, pp. 36-48, 2014" 
doi="https://www.sciencedirect.com/science/article/pii/S0097849314000144?via%3Dihub"
src="https://filipecn.files.wordpress.com/2015/07/teapot.png" 
pdf="../files/aatri_cag14.pdf" 
a2link="http://www.icmc.usp.br/%7Eapneto/" a2="Afonso Paiva"
a1="F.C. Nascimento" 
a3link="http://lhf.impa.br/" a3="L.H. Figueiredo"
a4link="http://www.ic.unicamp.br/%7Estolfi" a4="J. Stolfi"
 >}}
 
---

 {{< papercard  title="Approximating implicit curves on triangulations with affine arithmetic" 
abstract="We present an adaptive method for computing a robust polygonal approximation of an implicit curve in the plane that uses affine arithmetic to identify regions where the curve lies inside a thin strip. Unlike other interval methods, even those based on affine arithmetic, our method works on triangulations, not only on rectangular quadtrees. " 
conference="Proceedings of SIBGRAPI 2012, IEEE Press, pp. 94-101, 2012" 
doi="https://www.computer.org/csdl/proceedings-article/sibgrapi/2012/4829a094/12OmNx7XGZ5"
src="https://filipecn.files.wordpress.com/2015/07/aatri_sib2012.png" 
pdf="../files/sib.pdf" 
a1link="http://www.icmc.usp.br/%7Eapneto/" a1="Afonso Paiva"
a2="F.C. Nascimento" 
a3link="http://lhf.impa.br/" a3="L.H. Figueiredo"
a4link="http://www.ic.unicamp.br/%7Estolfi" a4="J. Stolfi"
 >}}

