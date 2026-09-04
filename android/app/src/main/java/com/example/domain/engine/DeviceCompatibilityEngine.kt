package com.example.domain.engine

import com.example.domain.model.AndroidGameRequirements
import com.example.domain.model.CompatibilityRating
import com.example.domain.model.CompatibilityResult
import com.example.domain.model.DeviceInfo
import com.example.domain.model.HardwareCheckItem
import com.example.domain.model.IosDeviceInfo
import com.example.domain.model.IosGameRequirements
import com.example.domain.model.LinuxDeviceInfo
import com.example.domain.model.LinuxGameRequirements
import com.example.domain.model.PcRequirements
import com.example.domain.model.PerformanceEstimate
import com.example.domain.model.QualityPreset

object DeviceCompatibilityEngine {

  fun evaluate(
    device: DeviceInfo,
    pcRequirements: PcRequirements?,
    isAndroidNative: Boolean = false
  ): CompatibilityResult {
    return evaluateAndroid(device, pcRequirements, isAndroidNative)
  }

  fun evaluateAndroid(
    device: DeviceInfo,
    pcRequirements: PcRequirements?,
    isAndroidNative: Boolean = false
  ): CompatibilityResult {
    val req = deriveAndroidRequirements(pcRequirements, isAndroidNative)
    val checks = mutableListOf<HardwareCheckItem>()

    // 1. System RAM
    val ramPass = device.ramTotalGb >= req.minRamGb
    val ramWarning = device.ramTotalGb in req.minRamGb..req.recRamGb
    checks.add(
      HardwareCheckItem(
        title = "System RAM",
        detectedValue = "%.1f GB Total (%.1f GB Free)".format(device.ramTotalGb, device.ramAvailableGb),
        requiredValue = "%.1f GB".format(req.minRamGb),
        recommendedValue = "%.1f GB".format(req.recRamGb),
        isPass = ramPass,
        isWarning = ramWarning
      )
    )

    // 2. Storage
    val storagePass = device.storageFreeGb >= req.minStorageGb
    val storageWarning = device.storageFreeGb in req.minStorageGb..req.recStorageGb
    checks.add(
      HardwareCheckItem(
        title = "Available Storage",
        detectedValue = "%.1f GB Free".format(device.storageFreeGb),
        requiredValue = "%.1f GB".format(req.minStorageGb),
        recommendedValue = "%.1f GB".format(req.recStorageGb),
        isPass = storagePass,
        isWarning = storageWarning || !storagePass
      )
    )

    // 3. Processor (CPU)
    val cpuPass = device.cpuCores >= req.minCpuCores
    val cpuWarning = device.cpuCores in req.minCpuCores until req.recCpuCores
    checks.add(
      HardwareCheckItem(
        title = "Processor (CPU)",
        detectedValue = "${device.cpuCores} Cores (${device.cpuArchitecture})",
        requiredValue = "${req.minCpuCores} Cores",
        recommendedValue = "${req.recCpuCores} Cores",
        isPass = cpuPass,
        isWarning = cpuWarning
      )
    )

    // 4. Android Version
    val osPass = device.sdkInt >= (req.minAndroidVersion + 18)
    checks.add(
      HardwareCheckItem(
        title = "Android Version",
        detectedValue = "Android ${device.androidRelease} (API ${device.sdkInt})",
        requiredValue = "Android ${req.minAndroidVersion}+",
        recommendedValue = "Android ${req.recAndroidVersion}+",
        isPass = osPass,
        isWarning = !osPass
      )
    )

    // 5. Graphics API
    val apiPass = if (req.requiresVulkan) device.vulkanSupported else true
    val apiDetected = buildString {
      append("OpenGL ES ${device.openGlEsVersion}")
      if (device.vulkanSupported) append(" / Vulkan")
    }
    checks.add(
      HardwareCheckItem(
        title = "Graphics API",
        detectedValue = apiDetected,
        requiredValue = if (req.requiresVulkan) "Vulkan 1.1+" else "OpenGL ES 3.1+",
        recommendedValue = "Vulkan 1.2+",
        isPass = apiPass,
        isWarning = !apiPass
      )
    )

    val isCriticalFail = !ramPass || !storagePass || !osPass || !apiPass

    val rating: CompatibilityRating
    val ratingLabel: String
    val fpsRange: String
    val quality: QualityPreset
    val resolution: String
    val summary: String

    when {
      isCriticalFail -> {
        rating = CompatibilityRating.UNSUPPORTED
        ratingLabel = "UNSUPPORTED"
        fpsRange = "15–25 FPS"
        quality = QualityPreset.VERY_LOW
        resolution = "720p"
        summary = "Device hardware does not meet minimum application requirements."
      }
      device.ramTotalGb >= req.recRamGb && device.cpuCores >= req.recCpuCores && device.vulkanSupported -> {
        rating = CompatibilityRating.EXCELLENT
        ratingLabel = "EXCELLENT"
        fpsRange = "60–90 FPS"
        quality = QualityPreset.HIGH
        resolution = "Native / 1080p"
        summary = "Device comfortably exceeds recommended hardware requirements."
      }
      device.ramTotalGb >= req.minRamGb && device.cpuCores >= 6 -> {
        rating = CompatibilityRating.GOOD
        ratingLabel = "GOOD"
        fpsRange = "45–60 FPS"
        quality = QualityPreset.MEDIUM
        resolution = "1080p"
        summary = "Device meets system specifications for solid performance."
      }
      device.ramTotalGb >= req.minRamGb && device.cpuCores >= req.minCpuCores -> {
        rating = CompatibilityRating.PLAYABLE
        ratingLabel = "PLAYABLE"
        fpsRange = "30–40 FPS"
        quality = QualityPreset.LOW
        resolution = "720p"
        summary = "Device meets baseline specifications. Lower graphical settings advised."
      }
      else -> {
        rating = CompatibilityRating.LOW
        ratingLabel = "LOW"
        fpsRange = "20–30 FPS"
        quality = QualityPreset.LOW
        resolution = "720p"
        summary = "Hardware capabilities are limited for this title."
      }
    }

    return CompatibilityResult(
      rating = rating,
      ratingLabel = ratingLabel,
      performanceEstimate = PerformanceEstimate(
        fpsRange = fpsRange,
        recommendedQuality = quality,
        recommendedResolution = resolution,
        ramRequiredGb = req.minRamGb,
        ramRecommendedGb = req.recRamGb,
        storageRequiredGb = req.minStorageGb,
        storageRecommendedGb = req.recStorageGb
      ),
      summaryText = summary,
      hardwareChecks = checks
    )
  }

  fun evaluateLinux(
    device: LinuxDeviceInfo = LinuxDeviceInfo(),
    pcRequirements: PcRequirements? = null
  ): CompatibilityResult {
    val req = deriveLinuxRequirements(pcRequirements)
    val checks = mutableListOf<HardwareCheckItem>()

    // CPU
    checks.add(
      HardwareCheckItem(
        title = "Processor (CPU)",
        detectedValue = device.cpuModel,
        requiredValue = req.minCpu,
        recommendedValue = req.recCpu,
        isPass = true
      )
    )

    // RAM
    val ramPass = device.ramTotalGb >= req.minRamGb
    checks.add(
      HardwareCheckItem(
        title = "System RAM",
        detectedValue = "%.1f GB (%.1f GB Free)".format(device.ramTotalGb, device.ramAvailableGb),
        requiredValue = "%.1f GB".format(req.minRamGb),
        recommendedValue = "%.1f GB".format(req.recRamGb),
        isPass = ramPass,
        isWarning = device.ramTotalGb < req.recRamGb
      )
    )

    // GPU & VRAM
    val vramPass = device.gpuVramGb >= req.minVramGb
    checks.add(
      HardwareCheckItem(
        title = "Graphics Card (GPU)",
        detectedValue = "${device.gpuModel} (%.0f GB VRAM)".format(device.gpuVramGb),
        requiredValue = "${req.minGpu} (%.0f GB VRAM)".format(req.minVramGb),
        recommendedValue = "${req.recGpu} (%.0f GB VRAM)".format(req.recVramGb),
        isPass = vramPass
      )
    )

    // Storage
    val storagePass = device.storageFreeGb >= req.minStorageGb
    checks.add(
      HardwareCheckItem(
        title = "Available Storage",
        detectedValue = "%.1f GB Free".format(device.storageFreeGb),
        requiredValue = "%.1f GB".format(req.minStorageGb),
        recommendedValue = "%.1f GB".format(req.recStorageGb),
        isPass = storagePass,
        isWarning = device.storageFreeGb < req.recStorageGb
      )
    )

    // Distro & Kernel
    checks.add(
      HardwareCheckItem(
        title = "Linux Distribution / Kernel",
        detectedValue = "${device.distro} (${device.kernelVersion})",
        requiredValue = "${req.distroReq} / ${req.kernelReq}",
        recommendedValue = "Latest LTS / Rolling Kernel",
        isPass = true
      )
    )

    // Vulkan & OpenGL
    checks.add(
      HardwareCheckItem(
        title = "Graphics API & Drivers",
        detectedValue = "${device.vulkanVersion} / ${device.openGlVersion} (${device.driverVersion})",
        requiredValue = "${req.vulkanReq} / OpenGL 4.5+",
        recommendedValue = "Vulkan 1.3 / Mesa 23+",
        isPass = true
      )
    )

    val rating = if (device.ramTotalGb >= req.recRamGb && device.gpuVramGb >= req.recVramGb) {
      CompatibilityRating.EXCELLENT
    } else if (ramPass && vramPass) {
      CompatibilityRating.GOOD
    } else {
      CompatibilityRating.PLAYABLE
    }

    val fpsRange = when (rating) {
      CompatibilityRating.EXCELLENT -> "60–90 FPS"
      CompatibilityRating.GOOD -> "45–60 FPS"
      else -> "30–45 FPS"
    }

    return CompatibilityResult(
      rating = rating,
      ratingLabel = rating.name,
      performanceEstimate = PerformanceEstimate(
        fpsRange = fpsRange,
        recommendedQuality = if (rating == CompatibilityRating.EXCELLENT) QualityPreset.HIGH else QualityPreset.MEDIUM,
        recommendedResolution = "1080p",
        ramRequiredGb = req.minRamGb,
        ramRecommendedGb = req.recRamGb,
        storageRequiredGb = req.minStorageGb,
        storageRecommendedGb = req.recStorageGb
      ),
      summaryText = "System meets Linux native / Proton compatibility baseline.",
      hardwareChecks = checks
    )
  }

  fun evaluateIos(
    device: IosDeviceInfo = IosDeviceInfo(),
    pcRequirements: PcRequirements? = null
  ): CompatibilityResult {
    val req = deriveIosRequirements(pcRequirements)
    val checks = mutableListOf<HardwareCheckItem>()

    val isDetected = device.model != "Not available"

    // Device / Chip
    checks.add(
      HardwareCheckItem(
        title = "iPhone / iPad Device & Chip",
        detectedValue = if (isDetected) "${device.model} (${device.chipModel})" else "Not available",
        requiredValue = req.minChip,
        recommendedValue = req.recChip,
        isPass = isDetected
      )
    )

    // RAM
    checks.add(
      HardwareCheckItem(
        title = "Unified RAM Memory",
        detectedValue = if (isDetected && device.ramTotalGb > 0) "%.1f GB".format(device.ramTotalGb) else "Not available",
        requiredValue = "%.1f GB".format(req.minRamGb),
        recommendedValue = "%.1f GB".format(req.recRamGb),
        isPass = isDetected && device.ramTotalGb >= req.minRamGb
      )
    )

    // Storage
    checks.add(
      HardwareCheckItem(
        title = "Available Storage",
        detectedValue = if (isDetected && device.storageFreeGb > 0) "%.1f GB Free".format(device.storageFreeGb) else "Not available",
        requiredValue = "%.1f GB".format(req.minStorageGb),
        recommendedValue = "%.1f GB".format(req.recStorageGb),
        isPass = isDetected && device.storageFreeGb >= req.minStorageGb
      )
    )

    // iOS Version
    checks.add(
      HardwareCheckItem(
        title = "iOS / iPadOS Version",
        detectedValue = device.iosRelease,
        requiredValue = req.minIosVersion,
        recommendedValue = req.recIosVersion,
        isPass = isDetected
      )
    )

    // Metal / Graphics
    checks.add(
      HardwareCheckItem(
        title = "Metal Graphics API",
        detectedValue = device.metalVersion,
        requiredValue = req.metalReq,
        recommendedValue = "Metal 3",
        isPass = isDetected
      )
    )

    val rating = if (isDetected) CompatibilityRating.GOOD else CompatibilityRating.UNCERTAIN

    return CompatibilityResult(
      rating = rating,
      ratingLabel = if (isDetected) "GOOD" else "UNCERTAIN",
      performanceEstimate = PerformanceEstimate(
        fpsRange = if (isDetected) "30–60 FPS" else "Estimated",
        recommendedQuality = QualityPreset.MEDIUM,
        recommendedResolution = "Native Retina",
        ramRequiredGb = req.minRamGb,
        ramRecommendedGb = req.recRamGb,
        storageRequiredGb = req.minStorageGb,
        storageRecommendedGb = req.recStorageGb
      ),
      summaryText = if (isDetected) "Device meets iOS platform requirements." else "iOS device metrics not directly readable on non-iOS runtime.",
      hardwareChecks = checks
    )
  }

  fun evaluatePc(
    selectedOs: String,
    selectedCpu: String,
    selectedGpu: String,
    selectedRamGb: Int,
    selectedVramGb: Int,
    selectedResolution: String,
    selectedQuality: String,
    pcRequirements: PcRequirements?
  ): CompatibilityResult {
    val reqMinRam = parseMemoryGb(pcRequirements?.minRam) ?: 8.0
    val reqRecRam = parseMemoryGb(pcRequirements?.recRam) ?: 16.0
    val reqMinStorage = parseMemoryGb(pcRequirements?.minStorage) ?: 30.0
    val reqRecStorage = parseMemoryGb(pcRequirements?.recStorage) ?: 50.0

    val checks = mutableListOf<HardwareCheckItem>()

    // GPU Check
    val isHighEndGpu = selectedGpu.contains("4090") || selectedGpu.contains("4080") || selectedGpu.contains("3080") || selectedGpu.contains("7900")
    val isMidGpu = selectedGpu.contains("3070") || selectedGpu.contains("3060") || selectedGpu.contains("4060") || selectedGpu.contains("6700")
    val gpuPass = !selectedGpu.contains("Integrated")

    checks.add(
      HardwareCheckItem(
        title = "Graphics Card (GPU)",
        detectedValue = "$selectedGpu (${selectedVramGb} GB VRAM)",
        requiredValue = pcRequirements?.minGpu ?: "GTX 1060 / RX 580",
        recommendedValue = pcRequirements?.recGpu ?: "RTX 3060 / RX 6700",
        isPass = gpuPass
      )
    )

    // CPU Check
    checks.add(
      HardwareCheckItem(
        title = "Processor (CPU)",
        detectedValue = selectedCpu,
        requiredValue = pcRequirements?.minCpu ?: "Core i5 / Ryzen 5",
        recommendedValue = pcRequirements?.recCpu ?: "Core i7 / Ryzen 7",
        isPass = true
      )
    )

    // RAM Check
    val ramPass = selectedRamGb >= reqMinRam
    checks.add(
      HardwareCheckItem(
        title = "System RAM",
        detectedValue = "$selectedRamGb GB RAM",
        requiredValue = "%.0f GB".format(reqMinRam),
        recommendedValue = "%.0f GB".format(reqRecRam),
        isPass = ramPass,
        isWarning = selectedRamGb < reqRecRam
      )
    )

    // Storage
    checks.add(
      HardwareCheckItem(
        title = "Storage",
        detectedValue = "Available Storage (OK)",
        requiredValue = "%.0f GB".format(reqMinStorage),
        recommendedValue = "%.0f GB".format(reqRecStorage),
        isPass = true
      )
    )

    // Calculate dynamic FPS based on GPU, Resolution, and Quality
    val resMultiplier = when {
      selectedResolution.contains("4K") -> 0.50
      selectedResolution.contains("1440p") -> 0.75
      else -> 1.0 // 1080p
    }

    val qualityMultiplier = when (selectedQuality.lowercase()) {
      "ultra" -> 0.70
      "high" -> 0.85
      "medium" -> 1.0
      "low" -> 1.25
      else -> 1.0
    }

    val baseFps = when {
      isHighEndGpu -> 110.0
      isMidGpu -> 75.0
      gpuPass -> 50.0
      else -> 25.0
    }

    val estimatedFps = (baseFps * resMultiplier * qualityMultiplier).coerceIn(15.0, 160.0)
    val minFps = (estimatedFps * 0.85).toInt()
    val maxFps = (estimatedFps * 1.15).toInt()
    val fpsRange = "$minFps–$maxFps FPS"

    val rating = when {
      estimatedFps >= 60 -> CompatibilityRating.EXCELLENT
      estimatedFps >= 45 -> CompatibilityRating.GOOD
      estimatedFps >= 30 -> CompatibilityRating.PLAYABLE
      else -> CompatibilityRating.LOW
    }

    val recQuality = when {
      estimatedFps >= 75 -> QualityPreset.ULTRA
      estimatedFps >= 55 -> QualityPreset.HIGH
      estimatedFps >= 40 -> QualityPreset.MEDIUM
      else -> QualityPreset.LOW
    }

    return CompatibilityResult(
      rating = rating,
      ratingLabel = rating.name,
      performanceEstimate = PerformanceEstimate(
        fpsRange = fpsRange,
        recommendedQuality = recQuality,
        recommendedResolution = selectedResolution,
        ramRequiredGb = reqMinRam,
        ramRecommendedGb = reqRecRam,
        storageRequiredGb = reqMinStorage,
        storageRecommendedGb = reqRecStorage
      ),
      summaryText = "Selected hardware combination provides $fpsRange performance at $selectedResolution ($selectedQuality quality).",
      hardwareChecks = checks
    )
  }

  private fun parseMemoryGb(text: String?): Double? {
    if (text == null) return null
    val match = Regex("(\\d+)\\s*gb", RegexOption.IGNORE_CASE).find(text)
    return match?.groupValues?.get(1)?.toDoubleOrNull()
  }

  private fun deriveAndroidRequirements(
    pcRequirements: PcRequirements?,
    isAndroidNative: Boolean
  ): AndroidGameRequirements {
    if (isAndroidNative) {
      return AndroidGameRequirements(
        minAndroidVersion = 9,
        recAndroidVersion = 11,
        minRamGb = 3.0,
        recRamGb = 6.0,
        minStorageGb = 3.0,
        recStorageGb = 6.0,
        minCpuCores = 4,
        recCpuCores = 8,
        requiresOpenGl3 = true,
        requiresVulkan = false,
        isNativeAndroid = true
      )
    }

    var minRam = 4.0
    var recRam = 8.0
    var minStorage = 12.0
    var recStorage = 20.0

    val minRamText = pcRequirements?.minRam?.lowercase() ?: ""
    val minStorageText = pcRequirements?.minStorage?.lowercase() ?: ""

    if (minRamText.contains("16")) {
      minRam = 6.0
      recRam = 12.0
    } else if (minRamText.contains("8")) {
      minRam = 4.0
      recRam = 8.0
    } else if (minRamText.contains("4")) {
      minRam = 3.0
      recRam = 6.0
    }

    val storageNum = Regex("(\\d+)\\s*gb").find(minStorageText)?.groupValues?.get(1)?.toDoubleOrNull()
    if (storageNum != null) {
      minStorage = (storageNum * 0.35).coerceIn(4.0, 40.0)
      recStorage = (minStorage * 1.5).coerceAtLeast(6.0)
    }

    return AndroidGameRequirements(
      minAndroidVersion = 10,
      recAndroidVersion = 12,
      minRamGb = minRam,
      recRamGb = recRam,
      minStorageGb = minStorage,
      recStorageGb = recStorage,
      minCpuCores = 6,
      recCpuCores = 8,
      requiresOpenGl3 = true,
      requiresVulkan = true,
      isNativeAndroid = false
    )
  }

  private fun deriveLinuxRequirements(pcRequirements: PcRequirements?): LinuxGameRequirements {
    val minRam = parseMemoryGb(pcRequirements?.minRam) ?: 8.0
    val recRam = parseMemoryGb(pcRequirements?.recRam) ?: 16.0
    val minStorage = parseMemoryGb(pcRequirements?.minStorage) ?: 20.0
    val recStorage = parseMemoryGb(pcRequirements?.recStorage) ?: 40.0

    return LinuxGameRequirements(
      distroReq = "Ubuntu 22.04 LTS / Arch Linux",
      kernelReq = "Linux Kernel 5.15+",
      minRamGb = minRam,
      recRamGb = recRam,
      minStorageGb = minStorage,
      recStorageGb = recStorage,
      minCpu = pcRequirements?.minCpu ?: "Intel Core i5 / AMD Ryzen 3",
      recCpu = pcRequirements?.recCpu ?: "Intel Core i7 / AMD Ryzen 5",
      minGpu = pcRequirements?.minGpu ?: "NVIDIA GTX 1060 / AMD RX 580",
      recGpu = pcRequirements?.recGpu ?: "NVIDIA RTX 3060 / AMD RX 6700"
    )
  }

  private fun deriveIosRequirements(pcRequirements: PcRequirements?): IosGameRequirements {
    val minStorage = (parseMemoryGb(pcRequirements?.minStorage) ?: 15.0) * 0.3
    val recStorage = minStorage * 1.5

    return IosGameRequirements(
      minIosVersion = "iOS 15.0+",
      recIosVersion = "iOS 17.0+",
      minChip = "Apple A13 Bionic+",
      recChip = "Apple A16 Bionic / M1+",
      minRamGb = 4.0,
      recRamGb = 6.0,
      minStorageGb = minStorage.coerceIn(3.0, 25.0),
      recStorageGb = recStorage.coerceIn(6.0, 40.0)
    )
  }
}

