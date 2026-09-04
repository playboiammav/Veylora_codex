package com.example.domain.model

enum class CompatibilityRating {
  EXCELLENT,
  GOOD,
  PLAYABLE,
  LOW,
  UNSUPPORTED,
  UNCERTAIN
}

enum class QualityPreset {
  VERY_LOW,
  LOW,
  MEDIUM,
  HIGH,
  ULTRA,
  N_A
}

data class HardwareCheckItem(
  val title: String,
  val detectedValue: String,
  val requiredValue: String,
  val recommendedValue: String = "",
  val isPass: Boolean,
  val isWarning: Boolean = false
)

data class PerformanceEstimate(
  val fpsRange: String,
  val recommendedQuality: QualityPreset,
  val recommendedResolution: String,
  val ramRequiredGb: Double,
  val ramRecommendedGb: Double,
  val storageRequiredGb: Double,
  val storageRecommendedGb: Double,
  val confidenceDisclaimer: String = "Estimated — not a benchmark"
)

data class DeviceInfo(
  val manufacturer: String,
  val model: String,
  val androidRelease: String,
  val sdkInt: Int,
  val cpuCores: Int,
  val cpuArchitecture: String,
  val ramTotalGb: Double,
  val ramAvailableGb: Double,
  val storageFreeGb: Double,
  val storageTotalGb: Double,
  val openGlEsVersion: String,
  val vulkanSupported: Boolean,
  val displayResolution: String?
) {
  val deviceDisplayName: String
    get() = if (model.startsWith(manufacturer, ignoreCase = true)) model else "$manufacturer $model"
}

data class LinuxDeviceInfo(
  val distro: String = "Ubuntu 22.04 LTS / Arch Linux",
  val kernelVersion: String = "6.x Linux Kernel",
  val cpuModel: String = "x86_64 Multi-Core Processor",
  val cpuCores: Int = 8,
  val ramTotalGb: Double = 16.0,
  val ramAvailableGb: Double = 12.0,
  val gpuModel: String = "NVIDIA GeForce / AMD Radeon / Intel Arc",
  val gpuVramGb: Double = 8.0,
  val storageFreeGb: Double = 50.0,
  val vulkanVersion: String = "Vulkan 1.3",
  val openGlVersion: String = "OpenGL 4.6",
  val driverVersion: String = "Mesa / Proprietary Driver"
)

data class IosDeviceInfo(
  val model: String = "Not available",
  val iosRelease: String = "Not available",
  val chipModel: String = "Not available",
  val ramTotalGb: Double = 0.0,
  val ramAvailableGb: Double = 0.0,
  val storageFreeGb: Double = 0.0,
  val metalVersion: String = "Not available",
  val displayResolution: String = "Not available"
)

data class PcDeviceInfo(
  val osName: String = "Windows 11 64-bit",
  val cpuModel: String = "Intel Core i7 / AMD Ryzen 7",
  val cpuCores: Int = 8,
  val gpuModel: String = "NVIDIA RTX 3070 / AMD RX 6700 XT",
  val gpuVramGb: Double = 8.0,
  val ramTotalGb: Double = 16.0,
  val ramAvailableGb: Double = 12.0,
  val storageFreeGb: Double = 100.0,
  val directXVersion: String = "DirectX 12",
  val vulkanVersion: String = "Vulkan 1.3",
  val displayResolution: String = "1920x1080 (1080p)"
)

data class AndroidGameRequirements(
  val minAndroidVersion: Int = 8,
  val recAndroidVersion: Int = 10,
  val minRamGb: Double = 3.0,
  val recRamGb: Double = 6.0,
  val minStorageGb: Double = 4.0,
  val recStorageGb: Double = 8.0,
  val minCpuCores: Int = 4,
  val recCpuCores: Int = 8,
  val requiresOpenGl3: Boolean = true,
  val requiresVulkan: Boolean = false,
  val isNativeAndroid: Boolean = false
)

data class LinuxGameRequirements(
  val distroReq: String = "Ubuntu 20.04 LTS+",
  val kernelReq: String = "Kernel 5.4+",
  val minRamGb: Double = 8.0,
  val recRamGb: Double = 16.0,
  val minStorageGb: Double = 15.0,
  val recStorageGb: Double = 30.0,
  val minVramGb: Double = 2.0,
  val recVramGb: Double = 6.0,
  val minCpu: String = "Intel Core i5 / AMD Ryzen 3",
  val recCpu: String = "Intel Core i7 / AMD Ryzen 5",
  val minGpu: String = "NVIDIA GTX 1060 / AMD RX 580",
  val recGpu: String = "NVIDIA RTX 3060 / AMD RX 6700",
  val vulkanReq: String = "Vulkan 1.2+"
)

data class IosGameRequirements(
  val minIosVersion: String = "iOS 15.0+",
  val recIosVersion: String = "iOS 17.0+",
  val minChip: String = "Apple A12 Bionic+",
  val recChip: String = "Apple A15 Bionic / M1+",
  val minRamGb: Double = 4.0,
  val recRamGb: Double = 6.0,
  val minStorageGb: Double = 5.0,
  val recStorageGb: Double = 10.0,
  val metalReq: String = "Metal 2+"
)

data class CompatibilityResult(
  val rating: CompatibilityRating,
  val ratingLabel: String,
  val performanceEstimate: PerformanceEstimate,
  val summaryText: String,
  val hardwareChecks: List<HardwareCheckItem>,
  val confidenceDisclaimer: String = "Estimated — not a benchmark"
)

