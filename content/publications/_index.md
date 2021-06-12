# PUBLICATIONS
---
{{<disclaimer text="This site contains PDF files of articles that are covered by copyright. You may browse the articles at your convenience in the same spirit as you may read a journal or conference proceedings in a public library. Retrieving, copying, distributing these files, entirely or in parts, may violate copyright protection laws." >}}

---
{{< papercard  title="RBF Liquids: An Adaptive PIC Solver Using RBF-FD" 
abstract="We introduce a novel liquid simulation approach that combines a spatially adaptive pressure projection solver with the Particle-in-Cell (PIC) method. The solver relies on a generalized version of the Finite Difference (FD) method to approximate the pressure field and its gradients in tree-based grid discretizations, possibly non-graded. In our approach, FD stencils are computed by using meshfree interpolations provided by a variant of Radial Basis Function (RBF), known as RBF-Finite-Difference (RBF-FD). This meshfree version of the FD produces differentiation weights on scattered nodes with high-order accuracy. Our method adapts a quadtree/octree dynamically in a narrow-band around the liquid interface, providing an adaptive particle sampling for the PIC advection step. Furthermore, RBF affords an accurate scheme for velocity transfer between the grid and particles, keeping the system’s stability and avoiding numerical dissipation. We also present a data structure that connects the spatial subdivision of a quadtree/octree with the topology of its corresponding dual-graph. Our data structure makes the setup of stencils straightforward, allowing its updating without the need to rebuild it from scratch at each time-step. We show the effectiveness and accuracy of our solver by simulating incompressible inviscid fluids and comparing results with regular PIC-based solvers available in the literature." 
conference="ACM Siggraph Asia 2020 | ACM Transactions on Graphics" 
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
src="https://filipecn.files.wordpress.com/2015/07/aatri_sib2012.png" 
pdf="../files/sib.pdf" 
a1link="http://www.icmc.usp.br/%7Eapneto/" a1="Afonso Paiva"
a2="F.C. Nascimento" 
a3link="http://lhf.impa.br/" a3="L.H. Figueiredo"
a4link="http://www.ic.unicamp.br/%7Estolfi" a4="J. Stolfi"
 >}}

