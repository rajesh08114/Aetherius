import zipfile
import os

with zipfile.ZipFile("demo_goodlayers_com_traveltour_homepages_camper_1536w_default.make", 'r') as zip_ref:
    zip_ref.extractall("design_assets")
