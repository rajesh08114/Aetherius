import zipfile
import os

with zipfile.ZipFile("demo_goodlayers_com_traveltour_homepages_aetherius_1536w_default.make", 'r') as zip_ref:
    zip_ref.extractall("assets/design_assets")
