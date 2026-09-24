cmake_minimum_required(VERSION 3.22.1)

project("reface_native")

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Compile flags for mobile SIMD and optimization
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -ffast-math -Wall -Werror")

# Locate Android NDK libraries
find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)
find_library(mediandk-lib mediandk)

# Source files
add_library(
    reface_native
    SHARED
    native-lib.cpp
)

target_include_directories(
    reface_native
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/face
    ${CMAKE_CURRENT_SOURCE_DIR}/blending
    ${CMAKE_CURRENT_SOURCE_DIR}/tracking
    ${CMAKE_CURRENT_SOURCE_DIR}/pipeline
)

target_link_libraries(
    reface_native
    ${log-lib}
    ${jnigraphics-lib}
    ${mediandk-lib}
)
