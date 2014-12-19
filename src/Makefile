# Set up the executable file name here
PATCHEXE = bspatch
DIFFEXE  =bsdiff

#put in all the compiled file names here (all .c files with .o replacing .cpp)
OBJS= bzlib.o crctable.o compress.o decompress.o blocksort.o huffman.o randtable.o 
PATCHOBJS = bspatch.o 
DIFFOBJS  = bsdiff.o 
# list all the header files here (not the system headers)
HEADERS = bzlib.h bzlib_private.h
# name of the C compiler
CC = gcc
# compiler flags for C
CFLAGS = -Wall -O3

# this line says for a C program to generate a .o file
# do the next line (the next line must be indented with TAB;
# "C" means C and source files can end in .c);
# this automatically picks up CFLAGS (which we define) and
# CPPFLAGS (which we don't), and compiles with the command
# $(CC) $(CPPFLAGS) $(CFLAGS) -c:
#We include it however for completeness
.C.o:
	$(CC) $(CFLAGS) $< -c $@

# this line says if any of the files named on the OBJS line
# change, relink
#$(PATCHEXE): $(PATCHOBJS)
#	$(CC) -o $@ $(PATCHOBJS)

# this line says if Makefile or any headers change, rebuild everything
# where we have specific compilable files depending on specific
# headers you can write separate rules for each to reduce recompiles
bspatch:$(PATCHOBJS) $(OBJS) $(HEADERS)
	$(CC) $(PATCHOBJS) $(OBJS) $(HEADERS) -o bspatch

bsdiff:$(DIFFOBJS) $(OBJS) $(HEADERS)
	$(CC) $(DIFFOBJS) $(OBJS) $(HEADERS) -o bsdiff	

# Putting the Makefile in a rule is rare for simple programs
# because doing so cause a rebuild every time you make a
# trivial change (you can always remove Makefile from the
# above rule when making cosmetic changes like to comments
# like this).

# These are fake dependencies on a file that doesn't exist so
# you can create a target for make that describes an action
# rather than an output file. A common example: make clean
# gets rid of compiler and linker outputs. You can also add
# in install as a target if you want to copy the executable
# to a standard location

# remove compiled outputs
clean:
	rm -f $(OBJS) $(PATCHOBJS) $(DIFFOBJS)
