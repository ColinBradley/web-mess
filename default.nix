{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
    packages = [
        pkgs.deno
        pkgs.nodejs-17_x
    ];
}