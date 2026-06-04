# 目标光谱来源说明 — 遥感定标光源案例

## 数据来源

本案例使用的目标光谱基于以下公开文献与数据库中的代表性反射率特征构建。

所有数据重采样到 400–1000 nm，步长 5 nm（共 121 个波长点）。

## 目标清单

| ID | 名称 | 类别 | 数据来源 |
|----|------|------|----------|
| `green-veg` | 健康绿色植被 (Broadleaf) | 植被 | Gates et al. (1965); Knipling (1970); Jensen (2007) |
| `dry-grass` | 干枯植被 (Senescent Grass) | 植被 | Asner (1998); Daughtry et al. (2004) |
| `sandy-loam` | 砂壤土 (Sandy Loam) | 土壤 | Stoner & Baumgardner (1981); Ben-Dor et al. (1999) |
| `granite` | 花岗岩 (Granite) | 岩石 | Hunt & Salisbury (1970); Clark et al. (1993) |
| `asphalt` | 沥青路面 (Asphalt) | 人造地物 | Herold et al. (2004); Heiden et al. (2007) |
| `concrete` | 混凝土 (Concrete) | 人造地物 | Herold et al. (2004); Heiden et al. (2007) |
| `clear-water` | 清水体 (Clear Water) | 水体 | Mobley (1994); Pope & Fry (1997) |
| `white-panel` | 白板/校准靶 (Spectralon-like) | 校准目标 | Labsphere datasheet; Bruegge et al. (1993) |

## 数据口径

这些光谱是**基于已发表文献中典型反射率特征构建的教学用代表性光谱**，不是从光谱数据库逐条下载的原始数据。

原因：
1. ECOSTRESS/USGS/ASTER 光谱库的原始数据需要逐条下载和处理，在纯前端环境中不可行。
2. 本案例定位是课程级 emulator，教学代表性优先于数据库精度。
3. 每条光谱的关键特征（如植被的红边位置、叶绿素吸收深度、NIR 平台反射率）基于多篇文献交叉验证。

如需更精确的光谱数据用于研究，建议直接访问：
- ECOSTRESS Spectral Library: https://speclib.jpl.nasa.gov/
- USGS Spectral Library: https://crustal.usgs.gov/speclab/
- ASTER Spectral Library: https://speclib.jpl.nasa.gov/

## 参考文献

1. Gates DM, Keegan HJ, Schleter JC, Weidner VR (1965). "Spectral properties of plants." Appl. Opt. 4(1):11–20.
2. Knipling EB (1970). "Physical and physiological basis for the reflectance of visible and near-infrared radiation from vegetation." Remote Sens. Environ. 1(3):155–159.
3. Jensen JR (2007). "Remote Sensing of the Environment: An Earth Resource Perspective." Pearson.
4. Asner GP (1998). "Biophysical and biochemical sources of variability in canopy reflectance." Remote Sens. Environ. 64(3):234–253.
5. Daughtry CST, Hunt ER, McMurtrey JE (2004). "Assessing crop residue cover using shortwave infrared reflectance." Remote Sens. Environ. 93(1-2):198–210.
6. Stoner ER, Baumgardner MF (1981). "Characteristic variations in reflectance of surface soils." Soil Sci. Soc. Am. J. 45(6):1161–1165.
7. Hunt GR, Salisbury JW (1970). "Visible and near-infrared spectra of minerals and rocks." Mod. Geol. 1:283–300.
8. Clark RN et al. (1993). "The USGS Digital Spectral Library." USGS Open File Report 93-592.
9. Herold M, Roberts DA, Gardner ME, Dennison PE (2004). "Spectrometry for urban area remote sensing." Remote Sens. Environ. 93(3):304–318.
10. Heiden U, Segl K, Roessner S, Kaufmann H (2007). "Determination of robust spectral features for urban surface materials." Remote Sens. Environ. 106(3):285–305.
11. Mobley CD (1994). "Light and Water: Radiative Transfer in Natural Waters." Academic Press.
12. Pope RM, Fry ES (1997). "Absorption spectrum of pure water." Appl. Opt. 36(33):8710–8723.
13. Bruegge CJ, Stiegman AE, Rainen RA, Springsteen AW (1993). "Reflectance stability analysis of Spectralon." Proc. SPIE.
