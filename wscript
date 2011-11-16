from os.path import join, basename, splitext
from os import chdir
from glob import glob

VERSION='0.1'
APPNAME='messaging-plugins'

palm_programs = [
        "imaccountvalidator-1.0",
        "imlibpurpleservice-1.0",
        "imlibpurpletransport",
        ]

def options(opt):
    opt.load('compiler_c compiler_cxx')
    opt.load('libpurple palm_programs', tooldir='build_lib')
    opt.add_option('--protocols', action='store', default="msn,icq,jabber",
                   help="Protocols")

def configure(conf):
    conf.load('palm_programs', tooldir='build_lib')
    conf.parse_flags("-Wall -Werror -O2 -march=armv7-a", "BASE")
    conf.env.INCLUDES = []
    conf.env.CFLAGS = []
    conf.env.CXXFLAGS = []
    conf.env.ARCH = "-march=armv7-a"
    conf.env.append_value('LINKFLAGS_BASE', [])
    conf.env.append_value("LIBPATH_BASE", ["../libs"])

    conf.env.append_value("INCLUDES_GLIB", ["../include"])
    conf.env.append_value("LIB_GLIB", ["glib-2.0", "gobject-2.0"])
    conf.env.append_value("LIBPATH_GLIB", ["../libs"])

    plugins = [
        "autoaccept",
        "idle",
        "joinpart",
        "log_reader",
        "newline",
        "offlinemsg",
        "psychic",
        ]

    conf.configure_libpurple(protocols=conf.options.protocols.split(","),
                             plugins=plugins, ssl="gnutls")

def build(bld):
    bld.build_libpurple()
    bld.load('palm_programs', tooldir='build_lib')

