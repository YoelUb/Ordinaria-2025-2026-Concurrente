<div align="center">

# Optimización hidroeléctrica del río Sil

### Ubicación óptima de minicentrales mediante algoritmos genéticos multi-objetivo

<br>

![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![pymoo](https://img.shields.io/badge/pymoo-FF6F00?style=for-the-badge&logo=python&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)

![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge&logo=python&logoColor=white)
![QGIS](https://img.shields.io/badge/QGIS-589632?style=for-the-badge&logo=qgis&logoColor=white)
![Google Colab](https://img.shields.io/badge/Google_Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=white)

<br>

**Trabajo Fin de Grado — Grado en Ingeniería Informática**
**Universidad Alfonso X el Sabio (UAX)**

*Autor: Yoel Urquijo Barroso*

</div>

---

## 📋 Tabla de contenidos

1. [Descripción general](#-descripción-general)
2. [Fuentes de datos oficiales](#-fuentes-de-datos-oficiales)
3. [Estructura del repositorio](#-estructura-del-repositorio)
4. [Orden de ejecución](#-orden-de-ejecución)
5. [Requisitos](#-requisitos)
6. [Resultados principales](#-resultados-principales)
7. [Contacto](#-contacto)

---

## 🎯 Descripción general

Este proyecto desarrolla un sistema de optimización basado en **computación evolutiva multi-objetivo** para determinar la ubicación óptima de minicentrales hidroeléctricas en un tramo de 20 km de los **Cañones del río Sil** (Lugo, Galicia).

El sistema equilibra dos objetivos en conflicto:

| Objetivo | Meta |
|---|---|
|  **Energía anual generada** | Maximizar |
|  **Coste total de inversión** | Minimizar |

respetando las restricciones del **Real Decreto 413/2014** (límite de 10 MW para minicentrales).

Se comparan tres algoritmos genéticos multi-objetivo — **NSGA-II**, **SPEA2** y **MOEA/D** — mediante la librería **PyMOO**, con validación estadística (test de Wilcoxon + corrección de Holm-Bonferroni) y análisis de sensibilidad paramétrica.

---

## Fuentes de datos oficiales

| Dato | Fuente | Enlace |
|---|---|---|
|  Topografía (MDT05) | Instituto Geográfico Nacional (IGN), procesado con QGIS | [centrodedescargas.cnig.es](https://centrodedescargas.cnig.es/) |
|  Caudales | CEDEX — Anuario de Aforos, estación 1018 (río Sil) | [ceh.cedex.es/anuarioaforos](https://ceh.cedex.es/anuarioaforos/) |
|  Costes | IDAE (2006) — Manual de Minicentrales Hidroeléctricas | — |
|  Actualización IPC | INE — Índice de Precios al Consumo (factor ×1,505) | [ine.es](https://www.ine.es/) |

---

## 📁 Estructura del repositorio

```
.
├── README.md
├── requirements.txt
├── notebooks/
│   ├── Script-parametros-fisicos.ipynb   # Genera parametros_fisicos.csv
│   ├── Script-Precios.ipynb              # Genera parametros_costes.csv (IDAE + IPC)
│   ├── Script-CSV.ipynb                  # Une topografía + caudales → dataset final
│   └── Programa-TFG-pymoo.ipynb          # Benchmark NSGA-II / SPEA2 / MOEA/D
└── data/
    ├── Topografia_Rio_sil.csv            # Perfil topográfico (IGN/QGIS)
    ├── mensual_a.csv                     # Histórico mensual de caudales (CEDEX)
    ├── estaf.csv                         # Datos auxiliares de estaciones
    ├── parametros_fisicos.csv            # Parámetros físicos del modelo
    ├── parametros_costes.csv             # Parámetros económicos actualizados 2026
    └── Sil_Dataset_Completo.csv          # Dataset final (2.005 puntos × 8 columnas)
```

---

## ▶️ Orden de ejecución

Los notebooks deben ejecutarse en este orden, ya que cada uno genera datos que usa el siguiente:

| # | Notebook | Salida |
|---|---|---|
| 1 | `Script-parametros-fisicos.ipynb` | `parametros_fisicos.csv` |
| 2 | `Script-Precios.ipynb` | `parametros_costes.csv` |
| 3 | `Script-CSV.ipynb` | `Sil_Dataset_Completo.csv` |
| 4 | `Programa-TFG-pymoo.ipynb` | Benchmark + validación + sensibilidad |

>  **Nota:** los notebooks están preparados para **Google Colab** con acceso a Google Drive. Si se ejecutan en local, ajusta las rutas (`/content/drive/MyDrive/...`) a la ubicación de la carpeta `data/`.

---

##  Requisitos

Las librerías principales son:

- **pymoo** — algoritmos evolutivos multi-objetivo
- **numpy** — evaluación vectorizada
- **pandas** — procesamiento de datos
- **matplotlib** — gráficas
- **scipy** — tests estadísticos

Instalación:

```bash
pip install -r requirements.txt
```

---

##  Resultados principales

- **NSGA-II** seleccionado como algoritmo recomendado: estadísticamente equivalente a SPEA2 (Wilcoxon *p* = 0,375) pero con **mayor estabilidad** y **menor tiempo de cómputo**.
- Ambos superan significativamente a MOEA/D (*p* = 0,00195).

| Métrica | Valor |
|---|---|
|  Ubicación óptima | Tramo km 8–11 |
|  Potencia instalada | ~9,99 MW |
|  Producción anual | 54,4 GWh |
|  CAPEX | 31,7 M€ |
|  Periodo de retorno | 7,3 años |

---

<div align="center">

##  Contacto

Si tienes algunda duda no duda en escribir a **yurqubar@myuax.com**

</div>
