{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.glibcLocales
    pkgs.jq
    pkgs.unzip
  ];
}
